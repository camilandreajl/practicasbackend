import { Duration, Expiration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
// import { GraphqlApi, AuthorizationType, FieldLogLevel, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import { CUSTOMER, PROJECT } from '../config';

export class BackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = this.getPrevalentVPC()
    const cluster = this.buildDatabase(vpc);
    const lambda = this.buildLambda(cluster);
    const api = this.buildApiGateway(lambda);
    const s3 = this.buildS3();
  }

  addCustomerTags = (scope: Construct) => {
    Tags.of(scope).add('customer', CUSTOMER);
    Tags.of(scope).add('type', 'customer');
  };

  buildApiGateway(lambda: lambda.DockerImageFunction) {
    const apiGw = new apiGateway.LambdaRestApi(this, `${CUSTOMER}_${PROJECT}_GraphQL_Endpoint`, {
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

  buildLambda(cluster?: rds.DatabaseInstance) {
    // Lambda resolver
    const dockerfile = path.join(__dirname, '../api');
    const dockerLambda = new lambda.DockerImageFunction(
      this,
      `${CUSTOMER}_${PROJECT}_DockerLambda`,
      {
        functionName: `${CUSTOMER}_${PROJECT}_DockerLambda`,
        code: lambda.DockerImageCode.fromImageAsset(dockerfile),
        memorySize: 1024,
        timeout: Duration.seconds(60),
        environment: {
          SECRET_ID: cluster?.secret?.secretArn || '',
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        },
      }
    );
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

  buildDatabase(vpc: ec2.IVpc) {
    const sg = ec2.SecurityGroup.fromSecurityGroupId(this, 'sg-70719049', 'sg-70719049');
    // secret for postgres database
    const databaseSecret = new secretsManager.Secret(
      this,
      `${CUSTOMER}_${PROJECT}_DatabaseSecret`,
      {
        secretName: `${CUSTOMER}_${PROJECT}_DatabaseSecret`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: 'postgres',
          }),
          generateStringKey: 'password',
          excludeCharacters: '"@/\\-#{[()]};:=`',
        },
      }
    );
    this.addCustomerTags(databaseSecret);
    // postgres rds database
    const cluster = new rds.DatabaseInstance(this, `${CUSTOMER.toLowerCase()}-db`, {
      allocatedStorage:20,
      instanceIdentifier: `${CUSTOMER.toLowerCase()}-db`,
      databaseName: `${PROJECT.toLowerCase().replace(/-/g, '_')}`,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_5,
      }),
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromSecret(databaseSecret),
      securityGroups: [sg],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });
    this.addCustomerTags(cluster);
    return cluster;
  }

  buildS3() {
    const s3Bucket = new s3.Bucket(this, 's3-bucket', {
      bucketName: `${CUSTOMER.toLowerCase()}-${PROJECT.toLowerCase()}`,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false,
      publicReadAccess: true,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });
    this.addCustomerTags(s3Bucket);
    return s3Bucket;
  }

  getPrevalentVPC() {
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: 'vpc-87b759fa',
    });
    return vpc;
  }
}
