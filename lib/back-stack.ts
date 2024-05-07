import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Environment } from '../types';
import { ApiGateway } from './services/ApiGateway';
import { Fargate } from './services/Fargate';
import { Lambda } from './services/Lambda';
import { Rds } from './services/Rds';
import { S3 } from './services/S3';
import { SecretsManager } from './services/SecretManager';
import { Vpc } from './services/Vpc';
import { BUCKETS } from '../config';
export class BackStack extends Stack {
  deployEnvironment: Environment;
  constructor(scope: Construct, id: string, props?: StackProps, env?: Environment | undefined) {
    super(scope, id, props);

    this.deployEnvironment = env || Environment.DEV;

    const dbSecret = new SecretsManager(scope, id).buildSecretManager(
      'dbSecret',
      'secret to keep db credentials'
    );
    const applicationSecret = new SecretsManager(scope, id).buildSecretManager(
      'applicationSecret',
      'secret to keep environment variables'
    );

    const vpc = new Vpc(scope, id).buildVPC(this.deployEnvironment);

    const rds = new Rds(scope, id);
    const securityGroup = rds.buildDatabaseSecurityGroup(vpc, this.deployEnvironment);
    const cluster = rds.buildDatabase(vpc, securityGroup, this.deployEnvironment);

    const s3 = new S3(scope, id);
    const buckets = s3.buildS3Array(BUCKETS, this.deployEnvironment);
    const privateBucket = buckets.find((bucket) => !bucket.isPublic)?.bucket;

    const lambda = new Lambda(scope, id).buildServerLambda(
      cluster,
      privateBucket,
      applicationSecret
    );

    const apiGateway = new ApiGateway(scope, id).buildApiGateway(lambda, this.deployEnvironment);

    //Se genera server de fargate cuando el entorno sea produccion y el aplicativo lo requiera, de lo contrario desplegar en lambda
    // if (this.deployEnvironment === Environment.PROD) {
    //   //ecs fargate for gateway
    //   const fargate = new Fargate(scope, id);
    //   const { cluster: ecsCluster, fargateTaskDefinition } = fargate.buildECSCluster(
    //     '../api',
    //     dbSecret,
    //     vpc
    //   );
    //   const ecsService = fargate.buildECSFargateService(ecsCluster, fargateTaskDefinition, vpc);
    // }
  }
}
