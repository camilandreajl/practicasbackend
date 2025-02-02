import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Environment } from '../types';
import { APIGateway } from './services/APIGateway';
import { Fargate } from './services/Fargate';
import { Lambda } from './services/Lambda';
import { RDS } from './services/RDS';
import { S3 } from './services/S3';
import { SecretsManager } from './services/SecretsManager';
import { VPC } from './services/VPC';
import { BUCKETS } from '../config';
export class BackStack extends Stack {
  deployEnvironment: Environment;
  constructor(scope: Construct, id: string, props?: StackProps, env?: Environment | undefined) {
    super(scope, id, props);

    this.deployEnvironment = env || Environment.DEV;

    const dbSecret = new SecretsManager(this, `${id}-dbSecret`).buildSecretManager(
      `${id}-dbSecret`,
      'secret to keep db credentials',
      true
    );
    // Este secret es para almacenar las variables de entorno para evitar .env y deben ser guardadas manualmente por la consola de AWS
    const applicationSecret = new SecretsManager(
      this,
      `${id}-applicationSecret`
    ).buildSecretManager(`${id}-applicationSecret`, 'secret to keep environment variables', false);

    // Crear cluster de base de datos solo si el entorno es diferente de test
    let cluster = undefined;
    if (this.deployEnvironment !== Environment.TEST) {
      const vpc = new VPC(this, `${id}-vpc`).buildVPC(this.deployEnvironment);
      const rds = new RDS(this, `${id}-rds`);
      const securityGroup = rds.buildDatabaseSecurityGroup(vpc, this.deployEnvironment);
      cluster = rds.buildDatabase(vpc, securityGroup, dbSecret, this.deployEnvironment);
    }

    // Creando buckets públicos y privado y encontrando cual es el privado
    const s3 = new S3(this, `${id}-s3`);
    const buckets = s3.buildS3Array(BUCKETS, this.deployEnvironment);
    const privateBucket = buckets.find((bucket) => !bucket.isPublic)?.bucket;

    const lambda = new Lambda(this, `${id}-lambda`).buildServerLambda(
      cluster,
      privateBucket,
      dbSecret,
      applicationSecret,
      this.deployEnvironment
    );

    const apiGateway = new APIGateway(this, `${id}-apiGateway`).buildApiGateway(
      lambda,
      this.deployEnvironment
    );

    // Se genera server de fargate cuando el entorno sea produccion y el aplicativo lo requiera, de lo contrario desplegar en lambda
    // if (this.deployEnvironment === Environment.PROD) {
    //   //ecs fargate for gateway
    //   const fargate = new Fargate(this, `${id}-fargate`);
    //   const { cluster: ecsCluster, fargateTaskDefinition } = fargate.buildECSCluster(
    //     'api',
    //     dbSecret,
    //     vpc
    //   );
    //   const ecsService = fargate.buildECSFargateService(ecsCluster, fargateTaskDefinition, vpc);
    // }
  }
}
