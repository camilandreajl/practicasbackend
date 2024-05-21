import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ACCOUNT, CUSTOMER, PROJECT, REPO } from '../config';
import { Environment } from '../types';
import { SecretsManager } from './services/SecretsManager';
import { CodePipeline } from './services/CodePipeline';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // crear un secrets manager para guardar el token de GitHub
    const pipeLineSecret = new SecretsManager(scope, id).buildSecretManager(
      'pipeLineSecret',
      'secret to keep github credentials',
      false
    );

    // crear un role para que el pipeline pueda desplegar
    const pipeLine = new CodePipeline(scope, id);
    const role = pipeLine.buildPipelineRole();

    // construir el pipeline de DEV
    pipeLine.buildPipeline(role, pipeLineSecret, Environment.DEV);

    // construir el pipeline de PROD
    pipeLine.buildPipeline(role, pipeLineSecret, Environment.PROD);
  }
}
