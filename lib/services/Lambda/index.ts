import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { CIDR_RANGE, CUSTOMER, PROJECT } from '../../../config';

export class Lambda extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
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
