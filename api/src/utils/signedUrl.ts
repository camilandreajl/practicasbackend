import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'us-east-1' });

export const getObjectInBucket = async (
  path: string,
  isPublic?: boolean
): Promise<string> => {
  const Bucket = await getBucketName(isPublic);
  const command = new GetObjectCommand({
    Bucket,
    Key: decodeURIComponent(path),
  });

  // Note: Expires option is moved inside getSignedUrl function in v3
  return getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 }); // 1 day
};

export const getSignedUrlForPutObject = async (
  path: string,
  isPublic?: boolean
): Promise<string> => {
  const Bucket = getBucketName(isPublic);

  const command = new PutObjectCommand({
    Bucket,
    Key: decodeURIComponent(path),
  });

  // Note: Expires option is moved inside getSignedUrl function in v3
  return getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 }); // 1 day
};

export const uploadFileToBucket = async (
  path: string,
  file: any,
  isPublic?: boolean
) => {
  const Bucket = await getBucketName(isPublic);
  const command = new PutObjectCommand({
    Bucket,
    Key: decodeURIComponent(path),
    Body: file,
  });

  return await s3Client.send(command);
};

const getBucketName = (isPublic?: boolean): string => {
  let bucket = process.env.BUCKET_NAME;

  if (isPublic) {
    bucket = process.env.MEDIA_BUCKET_NAME;
    return bucket || '';
  }

  if (bucket) {
    return bucket;
  }

  return '';
};
