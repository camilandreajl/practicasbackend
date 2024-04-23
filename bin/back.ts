#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BackStack } from '../lib/back-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { ACCOUNT, APP_NAME, REGION, CUSTOMER } from '../config';
import { Environment } from '../types';

const app = new cdk.App();

const backStackDev = new BackStack(
  app,
  `${CUSTOMER}-${APP_NAME}-stack-${Environment.DEV}`,
  {
    env: { account: ACCOUNT, region: REGION },
  },
  Environment.DEV
);

const backStackProd = new BackStack(
  app,
  `${CUSTOMER}-${APP_NAME}-stack-${Environment.PROD}`,
  {
    env: { account: ACCOUNT, region: REGION },
  },
  Environment.PROD
);

// const pipelineStack = new PipelineStack(app, `${CUSTOMER}-${APP_NAME}-cicd`, {
//   env: { account: ACCOUNT, region: REGION },
// });
