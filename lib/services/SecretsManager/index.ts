import { Construct } from 'constructs';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';

export class SecretsManager extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  buildSecretManager(name: string, description: string, generateDbPassword: boolean) {
    const secretProps: secretsManager.SecretProps = generateDbPassword
      ? {
          secretName: name || '',
          description: description || '',
          generateSecretString: {
            secretStringTemplate: JSON.stringify({
              username: 'postgres', // cambiarlo si es necesario dependiendo del cliente.
            }),
            generateStringKey: 'password',
            excludeCharacters: '"@/\\-#{[()]};:=`,.\'<>!$%^&*()+~|?',
          },
        }
      : {
          secretName: name || '',
          description: description || '',
        };

    const secret = new secretsManager.Secret(this, `${name}`, secretProps);
    return secret;
  }
}
