import { Construct } from 'constructs';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';

export class SecretsManager extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
  buildSecretManager(name: string, description: string) {
    const secret = new secretsManager.Secret(this, `${name}`, {
      secretName: name || '',
      description: description || '',
    });
    return secret;
  }
}
