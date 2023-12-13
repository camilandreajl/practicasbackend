import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { ACCOUNT, CUSTOMER, PROJECT, REPO } from '../config';
import { Environment } from '../types';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // crear un secrets manager para guardar el token de GitHub
    const secret = this.buildSecretsManager();

    // // crear un role para que el pipeline pueda desplegar
    const role = this.buildPipelineRole();

    // construir el pipeline de DEV
    this.buildPipeline(role, secret, Environment.DEV);

    // construir el pipeline de PROD
    this.buildPipeline(role, secret, Environment.PROD);
  }

  buildSecretsManager() {
    // Define the secret for the SSH private key
    const secret = new secretsmanager.Secret(this, `${CUSTOMER}-${PROJECT}-github-integration`, {
      secretName: `${CUSTOMER}-${PROJECT}-github-integration`,
      description: 'Secret for the GitHub Oauth token',
    });

    return secret;
  }

  buildPipelineRole() {
    const role = new iam.Role(this, `${CUSTOMER}-${PROJECT}-codebuild-service-role`, {
      roleName: `${CUSTOMER}-${PROJECT}-codebuild-service-role`,
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      inlinePolicies: {
        CdkRoleAssumptionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['sts:AssumeRole'],
              resources: [
                `arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-deploy-role-${ACCOUNT}-us-east-1`,
                `arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-file-publishing-role-${ACCOUNT}-us-east-1`,
                `arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-image-publishing-role-${ACCOUNT}-us-east-1`,
                `arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-lookup-role-${ACCOUNT}-us-east-1`,
              ],
            }),
          ],
        }),
      },
    });

    return role;
  }

  buildPipeline(
    codeBuildServiceRole: cdk.aws_iam.Role,
    secret: cdk.aws_secretsmanager.Secret,
    env: Environment
  ) {
    const pipelineArtifactBucket = new s3.Bucket(this, `PipelineArtifactBucket${env}`, {
      bucketName: `${PROJECT}-ci-cd-artifact-bucket-${env}`.toLowerCase(),
      removalPolicy:
        env === Environment.PROD ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // Or DESTROY for dev environments
      autoDeleteObjects: env === Environment.DEV, // Set to true for dev environments
    });

    // artefacto para guardar el código fuente que se va a desplegar. Es output de el stage de GitHub e input del resto de stages.
    const pipelineSourceArtifact = new codepipeline.Artifact();

    // stage 1 para clonar el repositorio
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHubAccess',
      owner: 'prevalentWare',
      repo: REPO,
      branch: env === Environment.PROD ? 'main' : 'dev',
      oauthToken: secret.secretValue,
      output: pipelineSourceArtifact,
    });

    const sourceStage: cdk.aws_codepipeline.StageProps = {
      stageName: 'RepoSource',
      actions: [sourceAction],
    };

    // stage 2 para build
    // const buildStage: cdk.aws_codepipeline.StageProps = {};

    // // stage 3 para test
    // const testStage: cdk.aws_codepipeline.StageProps = {};

    // stage 4 para deploy

    const deployProject = new codebuild.PipelineProject(
      this,
      `${CUSTOMER}-${PROJECT}-deployproject-${env}`,
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          privileged: true, // necesario para poder usar docker dentro del build
        },
        role: codeBuildServiceRole,
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              commands: [
                'echo Instalando dependencias...',
                'npm i -g rimraf',
                'npm i -g yarn',
                'yarn install',
              ],
            },
            // esto no es necesario si no utilizamos .env en el Dockerfile
            pre_build: {
              commands: [
                'echo Preparando el build...',
                'cd api',
                'echo "DATABASE_URL=" > .env',
                // Add other environment variables as needed
                'cd ..',
              ],
            },
            build: {
              commmands: [
                'echo Desplegando el aplicativo...',
                `yarn deploy:${env === Environment.PROD ? 'prod' : 'dev'}`,
              ],
            },
          },
        }),
      }
    );

    const deployAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'DeployApplication',
      input: pipelineSourceArtifact,
      project: deployProject,
    });

    const deployStage: cdk.aws_codepipeline.StageProps = {
      stageName: `Deploy-${env}`,
      actions: [deployAction],
    };

    // construir el pipeline

    const pipeline = new codepipeline.Pipeline(this, `${CUSTOMER}-${PROJECT}-pipeline-${env}`, {
      pipelineName: `${CUSTOMER}-${PROJECT}-pipeline-${env}`,
      artifactBucket: pipelineArtifactBucket,
      stages: [sourceStage, deployStage],
    });
  }
}
