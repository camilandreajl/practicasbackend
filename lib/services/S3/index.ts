import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export class S3 extends Construct {
  public bucket: s3.Bucket;
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    const bucket = this.s3Constructor(props);
  }
  s3Constructor(props: any) {
    const s3Bucket = new s3.Bucket(this, props.name, {
      bucketName: props.name,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false,
      publicReadAccess: props.isPublic,
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
      ...(props.isPublic
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
}
