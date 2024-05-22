import { Resolver } from '@/types';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const generalResolvers: Resolver = {
  Query: {
    getSignedUrlForPutObject: async (parent, args, { db, session }) => {
      const client = new S3Client({ region: 'us-east-1' });

      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: args.key,
      });

      const signedUrl = await getSignedUrl(client, command, {
        expiresIn: 3600,
      });

      return signedUrl;
    },
  },
  Mutation: {},
};
export { generalResolvers };
