import { Construct } from 'constructs';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';

export class secretsManagerConstructor extends Construct {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    const secret = this.secretConstructor(props);
  }
  secretConstructor(props: any) {
    const secret = new secretsManager.Secret(this, `${props.name}`, {
      secretName: props.name || '',
      description: props.description || '',
    });
    return secret;
  }
}
