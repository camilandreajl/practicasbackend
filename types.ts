interface BucketInput {
  isPublic?: boolean;
  name: string;
}

enum Environment {
  DEV = 'dev',
  TEST = 'test',
  PROD = 'prod',
}

export { BucketInput, Environment };
