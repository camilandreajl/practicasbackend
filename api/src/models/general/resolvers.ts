import { Resolver } from '@/types';
import { getSignedUrlForUpload } from '@/utils/getSignedURL';

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
