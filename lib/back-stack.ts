import { Duration, Expiration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    const vpc = this.buildVPC();
    const securityGroup = this.buildDatabaseSecurityGroup(vpc);
    const cluster = this.buildDatabase(vpc, securityGroup);
    const lambda = this.buildServerLambda(cluster);
    const api = this.buildApiGateway(lambda);

    BUCKETS.forEach((bucket) =>
      this.buildS3({ name: `${bucket.name}-${env}`, isPublic: bucket.isPublic || false })
    );
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

  buildServerLambda(cluster?: rds.DatabaseInstance) {
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
          ? ec2.InstanceSize.MEDIUM
          : ec2.InstanceSize.MICRO
      ),
      vpc,
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
          allowedMethods: [s3.HttpMethods.GET],
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
}
