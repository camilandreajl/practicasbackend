import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const sm = new SecretsManagerClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const READ_EXPIRATION_SECONDS = 60 * 60; // 1 hour
const WRITE_EXPIRATION_SECONDS = 60 * 60 * 24; // 1 day

export const getSignedUrlFromS3 = async (
  bucketName: string,
  path: string
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: path,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: READ_EXPIRATION_SECONDS,
  });

  return signedUrl;
};

export const getSignedUrlForUpload = async (path: string): Promise<string> => {
  const Bucket = await getBucketName();
  const command = new PutObjectCommand({
    Bucket,
    Key: decodeURIComponent(path),
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: WRITE_EXPIRATION_SECONDS,
  });
};

const getBucketName = async (): Promise<string> => {
  if (process.env.BUCKET_NAME) {
    return process.env.BUCKET_NAME;
  }

  const getSecretValueCommand = new GetSecretValueCommand({
    SecretId: process.env.BACKEND_SECRETS || '',
  });

  const secret = await sm.send(getSecretValueCommand);
  const secretString = JSON.parse(secret.SecretString || '{}');
  return secretString.BUCKET_NAME ?? '';
};
