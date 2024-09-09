import { PrismaClient } from '@prisma/client';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const sm = new SecretsManagerClient({ region: 'us-east-1' });
const environment = process.env.DEPLOYENVIRONMENT || 'dev';

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

    url = `postgresql://${secretString.username}:${secretString.password}@${secretString.host}:${secretString.port}/${secretString.dbname}?schema=${environment}`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Error getting secret', e);
  }

  db = new PrismaClient({ datasources: { db: { url } } });
  return db;
};
