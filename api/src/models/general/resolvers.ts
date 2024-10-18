import { Resolver } from '@/types';
import { getSignedUrlForUpload, getSignedUrlsForFolder } from '@/utils/getSignedURL';

const generalResolvers: Resolver = {
	Query: {
		getSignedUrlForUpload: async (parent, args) => {
			return await {
				fileName: args.file,
				url: getSignedUrlForUpload(args.file),
			};
		},
		getSignedUrlsForFolder: async (parent, args) => {
			const { folderPath } = args;
			const signedUrls = await getSignedUrlsForFolder(folderPath);

			return signedUrls.map((url, index) => ({
				fileName: `file_${index}`,
				url,
			}));
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
