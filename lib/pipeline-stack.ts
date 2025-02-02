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
    const pipeLineSecret = new SecretsManager(this, `${id}-pipeLineSecret`).buildSecretManager(
      `${id}-pipeLineSecret`,
      'secret to keep github credentials',
      false
    );

    // crear un role para que el pipeline pueda desplegar
    const pipeLine = new CodePipeline(this, `${id}-pipeLine`);
    const role = pipeLine.buildPipelineRole();

    // construir el pipeline de DEV
    pipeLine.buildPipeline(role, pipeLineSecret, Environment.DEV);

    // construir el pipeline de TEST
    pipeLine.buildPipeline(role, pipeLineSecret, Environment.TEST);

    // construir el pipeline de PROD
    pipeLine.buildPipeline(role, pipeLineSecret, Environment.PROD);
  }
}
