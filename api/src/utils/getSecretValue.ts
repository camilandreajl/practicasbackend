import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const sm = new SecretsManagerClient({ region: 'us-east-1' });

export const getSecretValueFunction = async (secretARN: string) => {
  const getSecretValueCommand = new GetSecretValueCommand({
    SecretId: secretARN || '',
  });
  try {
    const JSONdata = await sm.send(getSecretValueCommand);
    const secretString = JSON.parse(JSONdata.SecretString || '{}');
    return secretString;
  } catch (error) {
    return Error(error as string);
  }
};
