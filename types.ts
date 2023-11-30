interface BucketInput {
  isPublic?: boolean;
  name: string;
}

enum Environment {
  DEV = 'dev',
  PROD = 'prod',
}

export { BucketInput, Environment };
