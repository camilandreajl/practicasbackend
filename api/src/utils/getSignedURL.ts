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

export const getSignedUrlFromS3 = async (
  bucketName: string,
  path: string,
  expirationSeconds: number
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: path,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expirationSeconds,
  });

  return signedUrl;
};

export const getSignedUrlForUpload = async (path: string): Promise<string> => {
  const Bucket = await getBucketName();
  const command = new PutObjectCommand({
    Bucket,
    Key: decodeURIComponent(path),
  });

  // Note: Expires option is moved inside getSignedUrl function in v3
  return getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 }); // 1 day
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
