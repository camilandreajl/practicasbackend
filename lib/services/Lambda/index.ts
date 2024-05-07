import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { CIDR_RANGE, CUSTOMER, PROJECT } from '../../../config';
import { Environment } from 'types';
import { env } from 'process';

export class Lambda extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  buildServerLambda(
    cluster?: rds.DatabaseInstance,
    bucket?: s3.Bucket,
    applicationSecrets?: secretsManager.Secret,
    environment?: Environment
  ) {
    // Lambda resolver
    const identifier = `${CUSTOMER}-${PROJECT}-server-${environment}`;
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
          resources: [bucket.bucketArn || ''],
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

  buildDBManagerLambda(
    rdsInstance: rds.DatabaseInstance,
    {
      startSchedule,
      stopSchedule,
    }: {
      startSchedule?: string | null;
      stopSchedule?: string | null;
    },
    deployEnvironment: string
  ): void {
    // Define the IAM role for the Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      roleName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-role-${deployEnvironment}`,
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
      functionName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-${deployEnvironment}`,
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
        ruleName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-start-${deployEnvironment}`,
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
        ruleName: `${CUSTOMER}-${PROJECT}-lambda-dbmanager-stop-${deployEnvironment}`,
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
