import { PrismaClient } from '@prisma/client';
import { SecretsManager } from 'aws-sdk';

const getTestEnv = () => {
  if (process?.env?.TEST === 'true') {
    return true;
  }

  return false;
};

const sm = new SecretsManager({ region: 'us-east-1' });
let db: PrismaClient;
export const getDB = async () => {
  if (db) return db;

  let url = '';
  try {
    const dbURL = await sm
      .getSecretValue({
        SecretId: process.env.SECRET_ID || '',
      })
      .promise();

    const secretString = JSON.parse(dbURL.SecretString || '{}');
    url = `postgresql://${secretString.username}:${secretString.password}@${secretString.host}:${secretString.port}/${secretString.dbname}`;
  } catch (e) {
    console.log('Error getting secret', e);
  }

  console.log('connection string: ', url);
  db = new PrismaClient({ datasources: { db: { url } } });
  return db;
};
