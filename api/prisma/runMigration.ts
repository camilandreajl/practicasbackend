import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { execSync } from 'child_process';
import 'dotenv/config';

const sm = new SecretsManagerClient({ region: 'us-east-1' });
export const runMigration = async () => {
  try {
    const schema = process.argv.slice(2)[0] 
    if (schema !== 'npx'){
      console.log('Obteniendo secret');
      const getSecretValueCommand = new GetSecretValueCommand({
        SecretId: process.env.SECRET_ID,
      });
      console.log('Secret obtenido');
      const dbURL = await sm.send(getSecretValueCommand);
      const secretString = JSON.parse(dbURL.SecretString || '{}');
      const url = `${secretString.DATABASE_URL ?? ''}?schema=${schema}`;
      process.env.DATABASE_URL = url;
      console.log('DB url: ', process.env.DATABASE_URL);
      console.log('Iniciando migracion');
      execSync(process.argv.slice(3).join(' ') ?? 'npx prisma migrate dev', { stdio: 'inherit' });
      console.log('Migracion finalizada');
    } else {
      console.error('Falta el esquema');
    }
  } catch (e) {
    console.log('Error getting secret', e);
    process.exit(1);
  }
};

runMigration();
