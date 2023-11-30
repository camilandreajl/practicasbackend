#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackStack } from '../lib/back-stack';
import { ACCOUNT, APP_NAME, REGION, CUSTOMER } from '../config';
import { Environment } from 'types';

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