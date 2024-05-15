import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';
import { BucketInput } from '../../../types';

export class S3 extends Construct {
  public bucket: s3.Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
  buildS3(name: string, isPublic: boolean) {
    const s3Bucket = new s3.Bucket(this, name, {
      bucketName: name,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false,
      publicReadAccess: isPublic,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      ...(isPublic
        ? {
            blockPublicAccess: {
              blockPublicAcls: false,
              blockPublicPolicy: false,
              ignorePublicAcls: false,
              restrictPublicBuckets: false,
            },
          }
        : {}),
    });
    return s3Bucket;
  }

  buildS3Array(buckets: BucketInput[], env: string) {
    return buckets.map((bucket) => {
      return {
        isPublic: bucket.isPublic || false,
        bucket: this.buildS3(`${bucket.name}-${env}`, bucket.isPublic || false),
      };
    });
  }
}
