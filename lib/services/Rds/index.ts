import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { ScheduleType, buildCron } from '../../../utils/cron';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import { Lambda } from '../Lambda';
import { Environment } from '../../../types';
import { CUSTOMER, PROJECT } from '../../../config';
import { SecretsManager } from '../SecretManager';

export class Rds extends Construct {
  private secret: secretsManager.Secret;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.secret = new SecretsManager(scope, id).buildSecretManager(
      'rds-secret',
      'secret to keep rds connection string'
    );
  }

  buildDatabase(vpc: ec2.IVpc, securityGroup: ec2.SecurityGroup, deployEnvironment: string) {
    // secret for postgres database
    const secretIdentifier = `${CUSTOMER}-${PROJECT}-dbsecret-${deployEnvironment}`;
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

    const project = PROJECT.toLowerCase().replace(/-/g, '_');
    const identifier = `${CUSTOMER.toLowerCase()}-${project}-db-${deployEnvironment}`;

    const cluster = new rds.DatabaseInstance(this, identifier, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        deployEnvironment === Environment.PROD ? ec2.InstanceSize.MICRO : ec2.InstanceSize.MICRO
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

    if (deployEnvironment === Environment.PROD) {
      // add a lambda function to turn off or start the database
      new Lambda(
        this,
        `${CUSTOMER.toLowerCase()}-${PROJECT}-dbmanager-${deployEnvironment}`
      ).buildDBManagerLambda(
        cluster,
        {
          startSchedule: null,
          stopSchedule: buildCron(ScheduleType.EVERY_DAY, 18, -5),
        },
        deployEnvironment
      );
    }

    if (deployEnvironment === Environment.DEV) {
      // add a lambda function to turn off or start the database
      new Lambda(
        this,
        `${CUSTOMER.toLowerCase()}-${PROJECT}-dbmanager-${deployEnvironment}`
      ).buildDBManagerLambda(
        cluster,
        {
          startSchedule: null, // buildCron(ScheduleType.EVERY_DAY, 6, -5),
          stopSchedule: buildCron(ScheduleType.EVERY_DAY, 18, -5),
        },
        deployEnvironment
      );
    }

    //this.addCustomerTags(cluster);
    return cluster;
  }
}
