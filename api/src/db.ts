import { PrismaClient } from '@prisma/client';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const getTestEnv = () => {
  if (process?.env?.TEST === 'true') {
    return true;
  }

  return false;
};

const sm = new SecretsManagerClient({ region: 'us-east-1' });

let db: PrismaClient;
export const getDB = async () => {
  if (db) return db;

  let url = process.env.DATABASE_URL || 'no env variable found';
  try {
    const getSecretValueCommand = new GetSecretValueCommand({
      SecretId: process.env.SECRET_ID || '',
    });

    const dbURL = await sm.send(getSecretValueCommand);

    const secretString = JSON.parse(dbURL.SecretString || '{}');
    url = `${secretString.DATABASE_URL ?? ''}?schema=dev`;
  } catch (e) {
    console.log('Error getting secret', e);
  }

  console.log('connection string: ', url);
  db = new PrismaClient({ datasources: { db: { url } } });
  return db;
};
