# AWS CDK Backend Boilerplate
## Overview
This boilerplate project serves as a foundational template for backend development, leveraging AWS Cloud Development Kit (CDK) for infrastructure deployment. It's designed to streamline the setup of AWS services and CI/CD pipelines, providing a robust starting point for new backend projects.

## Features
AWS Service Deployment: Automated deployment scripts for key AWS services:

- Amazon RDS
- Amazon S3
- AWS Lambda with Docker container support
- Amazon API Gateway
- Secrets Manager
- VPC
- Security Groups
- CI/CD Pipelines: Two GitHub-connected pipelines for seamless deployment:

    - Development pipeline linked to the dev branch
    - Production pipeline linked to the main branch
    - Both pipelines trigger on push events, ensuring consistent infrastructure across environments with size variations (e.g., RDS instance sizes differ between environments).
    - Cost-Optimized RDS Management: Specialized Lambda functions to schedule RDS clusters' on/off times, optimizing costs.

- Flexible API Development: An api directory for backend development, adaptable to any programming language compatible with Lambda's Docker base image.

## Getting Started
- Prerequisites: 
    - Ensure you have AWS CLI and AWS CDK installed and configured.
    - NodeJS 18 at least is required.
    - A local docker installation.
    - VSCode is recommended but not required.
- Clone the Repository: `git clone git@github.com:prevalentWare/web-boiler-back-lambda.git`.
- Install Dependencies: Navigate to the project directory and run `yarn install` (or equivalent for your setup).
- Customize Configuration: Modify the `config.ts` file to suit your environment and AWS setup.
    - Add the name of the customer, the app, and the project
    - Add the CIDR range for the customer
    - Add the name of the repository in GitHub.
    - Add the required bucket names.
- Deploy: Run `yarn deploy --all` to deploy your backend infrastructure locally.
- Develop: Add your backend code in the api folder, following the guidelines for Lambda-compatible Docker development.

## Environment Configuration
- RDS Instance Sizes: Configure in `lib/back-stack.ts` the sizes for RDS in the different environments.
- S3 Settings: Define bucket names and policies in lib/config/s3-config.ts.
- Lambda Functions: Customize Docker settings and function triggers in lib/lambda.

## CI/CD Pipeline Setup
- Connecting GitHub: Set up GitHub repository connections in `lib/pipeline-stack`.
- Branch Configuration: Specify branch names and pipeline triggers in the pipeline files.
- Make sure to deploy the secrets manager first and then the rest of the pipeline.
- After deploying the secret, set up the GitHub token directly in Secrets Manager.

