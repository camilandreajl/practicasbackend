import { Resolver } from '@/types';
import { getSignedUrlForUpload } from '@/utils/getSignedURL';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const generalResolvers: Resolver = {
  Query: {
    getSignedUrlForUpload: async (parent, args) => {
      return await {
        fileName: args.file,
        url: getSignedUrlForUpload(args.file),
      };
    },
    getMultipleSignedUrlsForUpload: async (parent, args) => {
      return await Promise.all(
        args.files.map(async (file: string) => ({
          fileName: file,
          url: await getSignedUrlForUpload(file),
        }))
      );
    },
  },
  Mutation: {},
};
export { generalResolvers };
