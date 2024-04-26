import { Duration, Expiration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import { BUCKETS, CIDR_RANGE, CUSTOMER, PROJECT } from '../config';
import { BucketInput, Environment } from '../types';
import { ScheduleType, buildCron } from '../utils/cron';

export class BackStack extends Stack {
  deployEnvironment: Environment;
  constructor(scope: Construct, id: string, props?: StackProps, env?: Environment | undefined) {
    super(scope, id, props);

    this.deployEnvironment = env || Environment.DEV;

    const applicationSecrets = this.buildSecretsManager();
    const vpc = this.buildVPC();
    const securityGroup = this.buildDatabaseSecurityGroup(vpc);
    const cluster = this.buildDatabase(vpc, securityGroup);
    const buckets = this.buildS3Array(BUCKETS, env || '');
    const privateBucket = buckets.find((bucket) => !bucket.isPublic)?.bucket;
    const lambda = this.buildServerLambda(cluster, privateBucket, applicationSecrets);
    const api = this.buildApiGateway(lambda);
    const secret = cluster.secret;
    // Se genera server de fargate cuando el entorno sea produccion
    if (this.deployEnvironment === Environment.PROD) {
      //ecs fargate for gateway
      const { cluster: ecsCluster, fargateTaskDefinition } = this.buildECSCluster(
        '../api',
        secret,
        vpc
      );
      const ecsService = this.buildECSFargateService(ecsCluster, fargateTaskDefinition, vpc);
    }
  }

  addCustomerTags = (scope: Construct) => {
    Tags.of(scope).add('customer', CUSTOMER);
    Tags.of(scope).add('type', 'customer');
  };

  buildVPC() {
    const identifier = `${CUSTOMER}-${PROJECT}-vpc-${this.deployEnvironment}`;
    const vpc = new ec2.Vpc(this, identifier, {
      vpcName: identifier,
      ipAddresses: ec2.IpAddresses.cidr(CIDR_RANGE),
      maxAzs: 2,
      natGateways: 0, // Disable NAT gateways
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'Public',
          cidrMask: 24,
          // Enable auto-assign public IPv4 address
          mapPublicIpOnLaunch: true,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: 'Private',
          cidrMask: 24,
        },
      ],
    });
    return vpc;
  }

  buildDatabaseSecurityGroup(vpc: ec2.Vpc) {
    const identifier = `db-sg-${this.deployEnvironment}`;
    const securityGroup = new ec2.SecurityGroup(this, identifier, {
      securityGroupName: identifier,
      vpc,
      description: 'Allow postgres access',
      allowAllOutbound: true, // set to false if you want to control outbound traffic
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), // or specify a particular CIDR block or security group
      ec2.Port.tcp(5432)
    );

    return securityGroup;
  }

  buildApiGateway(lambda: lambda.DockerImageFunction) {
    const identifier = `${CUSTOMER}-${PROJECT}-api-${this.deployEnvironment}`;
    const apiGw = new apiGateway.LambdaRestApi(this, identifier, {
      restApiName: identifier,
      handler: lambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS,
        allowHeaders: [...apiGateway.Cors.DEFAULT_HEADERS, 'next-auth.session-token'],
      },
    });
    this.addCustomerTags(apiGw);
    return apiGw;
  }

  buildServerLambda(
    cluster?: rds.DatabaseInstance,
    bucket?: s3.Bucket,
    applicationSecrets?: secretsManager.Secret
  ) {
    // Lambda resolver
    const identifier = `${CUSTOMER}-${PROJECT}-server-${this.deployEnvironment}`;
    const dockerfile = path.join(__dirname, '../api');
    const dockerLambda = new lambda.DockerImageFunction(this, identifier, {
      functionName: identifier,
      code: lambda.DockerImageCode.fromImageAsset(dockerfile),
      memorySize: 1024,
      timeout: Duration.seconds(60),
      environment: {
        SECRET_ID: cluster?.secret?.secretArn || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        BUCKET_NAME: bucket?.bucketName || '',
        APPLICATION_SECRETS_ID: applicationSecrets?.secretArn || '',
      },
    });
    this.addCustomerTags(dockerLambda);
    if (cluster) {
      // Grant access to Secrets manager to fetch the secret
      dockerLambda.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['secretsmanager:GetSecretValue'],
          resources: [cluster.secret?.secretArn || ''],
        })
      );
    }
    if (bucket) {
      // Grant access to the private bucket
      dockerLambda.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:PutObject',
            's3:GetObject',
            's3:DeleteObject',
            's3:GetObjectVersion',
            's3:GetBucketLocation',
            's3:ListBucket',
          ],
          resources: [bucket.bucketArn || '', `${bucket.bucketArn}/*`],
        })
      );
    }
    if (applicationSecrets) {
      // Grant access to the secret manager
      dockerLambda.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['secretsmanager:GetSecretValue'],
          resources: [applicationSecrets.secretArn || ''],
        })
      );
    }
    return dockerLambda;
  }

  buildDatabase(vpc: ec2.IVpc, securityGroup: ec2.SecurityGroup) {
    // secret for postgres database
    const secretIdentifier = `${CUSTOMER}-${PROJECT}-dbsecret-${this.deployEnvironment}`;
    const databaseSecret = new secretsManager.Secret(this, secretIdentifier, {
      secretName: secretIdentifier,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres', // cambiarlo si es necesario dependiendo del cliente.
        }),

        generateStringKey: 'password',
        excludeCharacters: '"@/\\-#{[()]};:=`,.\'<>!$%^&*()+~|?',
      },
    });
    this.addCustomerTags(databaseSecret);
    // postgres rds database

    const project = PROJECT.toLowerCase().replace(/-/g, '_');
    const identifier = `${CUSTOMER.toLowerCase()}-${project}-db-${this.deployEnvironment}`;

    const cluster = new rds.DatabaseInstance(this, identifier, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        this.deployEnvironment === Environment.PROD
          ? ec2.InstanceSize.MICRO
          : ec2.InstanceSize.MICRO
      ),
      vpc,
      caCertificate: rds.CaCertificate.RDS_CA_RDS2048_G1,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      credentials: rds.Credentials.fromSecret(databaseSecret),
      allocatedStorage: 20,
      instanceIdentifier: identifier,
      databaseName: `${project}`,
      multiAz: false,
      publiclyAccessible: true,
      storageType: rds.StorageType.GP2,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroups: [securityGroup],
    });

    if (this.deployEnvironment === Environment.PROD) {
      // add a lambda function to turn off or start the database
      this.buildDBManagerLambda(cluster, {
        startSchedule: null,
        stopSchedule: buildCron(ScheduleType.EVERY_DAY, 18, -5),
      });
    }

    if (this.deployEnvironment === Environment.DEV) {
      // add a lambda function to turn off or start the database
      this.buildDBManagerLambda(cluster, {
        startSchedule: null, // buildCron(ScheduleType.EVERY_DAY, 6, -5),
        stopSchedule: buildCron(ScheduleType.EVERY_DAY, 18, -5),
      });
    }

    this.addCustomerTags(cluster);
    return cluster;
  }

  buildS3({ name, isPublic = false }: BucketInput) {
    const s3Bucket = new s3.Bucket(this, `s3-bucket-${name}`, {
      bucketName: name,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false,
      publicReadAccess: isPublic,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      ...(isPublic
        ? {
            blockPublicAccess: {
              blockPublicAcls: false,
              blockPublicPolicy: false,
              ignorePublicAcls: false,
              restrictPublicBuckets: false,
            },
          }
        : {}),
    });
    this.addCustomerTags(s3Bucket);
    return s3Bucket;
  }

  buildS3Array(buckets: BucketInput[], env: string) {
    return buckets.map((bucket) => {
      return {
        isPublic: bucket.isPublic || false,
        bucket: this.buildS3({
          name: `${bucket.name}-${env}`,
          isPublic: bucket.isPublic || false,
        }),
      };
    });
  }

  buildDBManagerLambda(
    rdsInstance: rds.DatabaseInstance,
    {
      startSchedule,
      stopSchedule,
    }: {
      startSchedule?: string | null;
      stopSchedule?: string | null;
    }
  ): void {
    // Define the IAM role for the Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      roleName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-role-${this.deployEnvironment}`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add permissions to the role to manage the RDS instance
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['rds:StartDBInstance', 'rds:StopDBInstance'],
        resources: [rdsInstance.instanceArn],
      })
    );

    // Define the Lambda function
    const dbManagerLambda = new lambda.Function(this, 'DBManagerLambda', {
      functionName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-${this.deployEnvironment}`,
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, '../utils/dbmanager')),
      handler: 'main.handler',
      role: lambdaRole,
      environment: {
        DB_INSTANCE_IDENTIFIER: rdsInstance.instanceIdentifier,
      },
    });

    // Add EventBridge triggers based on provided schedules
    if (startSchedule) {
      new events.Rule(this, 'StartDBRule', {
        ruleName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-start-${this.deployEnvironment}`,
        schedule: events.Schedule.expression(startSchedule),
        targets: [
          new targets.LambdaFunction(dbManagerLambda, {
            event: events.RuleTargetInput.fromObject({ action: 'start' }),
          }),
        ],
      });
    }

    if (stopSchedule) {
      new events.Rule(this, 'StopDBRule', {
        ruleName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-stop-${this.deployEnvironment}`,
        schedule: events.Schedule.expression(stopSchedule),
        targets: [
          new targets.LambdaFunction(dbManagerLambda, {
            event: events.RuleTargetInput.fromObject({ action: 'stop' }),
          }),
        ],
      });
    }
  }

  buildECSCluster(
    dockerFilePath: string,
    secret: secretsManager.ISecret | undefined,
    vpc: ec2.IVpc
  ) {
    const cluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc: vpc,
      clusterName: `${CUSTOMER}-${PROJECT}-cluster`,
      containerInsights: true,
    });
    this.addCustomerTags(cluster);

    // fargate task definition
    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDefinition', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });
    this.addCustomerTags(fargateTaskDefinition);

    const Dockerfile = path.join(__dirname, dockerFilePath);

    const container = fargateTaskDefinition.addContainer('TaskContainer', {
      // Use an image from Amazon ECR
      image: ecs.ContainerImage.fromAsset(Dockerfile, {
        file: 'Dockerfile.fargate',
      }),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `${CUSTOMER}-${PROJECT}-logs`,
      }),
      portMappings: [
        { containerPort: 80, hostPort: 80 },
        { containerPort: 443, hostPort: 443 },
      ],
      environment: {
        SECRET_ID: secret?.secretName || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        TEST: 'false',
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:80/healthcheck || exit 1'],
        interval: Duration.minutes(1),
        timeout: Duration.seconds(5),
        retries: 3,
        startPeriod: Duration.seconds(0),
      },
    });

    if (secret) {
      // Create an IAM policy statement that allows access to the secret
      const secretAccessPolicy = new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [secret.secretArn], // Ensure that `secret` is the AWS Secrets Manager secret object
        effect: iam.Effect.ALLOW,
      });

      // Attach the policy statement to the task role
      fargateTaskDefinition.taskRole.addToPrincipalPolicy(secretAccessPolicy);
    }

    this.addCustomerTags(container);
    return { cluster, fargateTaskDefinition };
  }

  buildECSFargateService(
    cluster: ecs.Cluster,
    taskDefinition: ecs.FargateTaskDefinition,
    vpc: ec2.IVpc,
    desiredCount: number = 2
  ) {
    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster: cluster, // Required
      desiredCount, // Default is 1
      taskDefinition: taskDefinition, // Required
      cpu: 512, // Default is 256
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true, // Default is true
      loadBalancerName: `${PROJECT}-lb`,
      healthCheckGracePeriod: Duration.minutes(1),
      propagateTags: ecs.PropagatedTagSource.TASK_DEFINITION,
      minHealthyPercent: 0,
      maxHealthyPercent: 400,
    });

    service.targetGroup.configureHealthCheck({
      port: '80',
      protocol: elbv2.Protocol.HTTP,
      enabled: true,
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      path: '/healthcheck',
      interval: Duration.minutes(3),
      timeout: Duration.minutes(1),
    });

    const lb = service.loadBalancer;
    const sg = new ec2.SecurityGroup(this, `${CUSTOMER}-HTTPS-SecurityGroup`, {
      vpc,
      securityGroupName: `${CUSTOMER}-HTTPS-SecurityGroup`,
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic from anywhere');
    lb.addSecurityGroup(sg);

    const certificateArn =
      'arn:aws:acm:us-east-1:957462150790:certificate/dd869319-e2bd-4298-b695-1291210cfe95';

    const httpsListener = lb.addListener('MyHttpsListener', {
      port: 443,
      certificates: [elbv2.ListenerCertificate.fromArn(certificateArn)],
      open: true,
      defaultTargetGroups: [service.targetGroup],
    });

    this.addCustomerTags(lb);
    this.addCustomerTags(service);
    this.addCustomerTags(service.service);
    return service;
  }

  buildSecretsManager() {
    // Define the secret for the SSH private key
    const secret = new secretsManager.Secret(
      this,
      `${CUSTOMER}-${PROJECT}-application-secrets-${this.deployEnvironment}`,
      {
        secretName: `${CUSTOMER}-${PROJECT}-application-secrets-${this.deployEnvironment}`,
        description: 'Secrets for the application',
      }
    );

    return secret;
  }
}
