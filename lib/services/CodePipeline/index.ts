import { Construct } from 'constructs';
import { CIDR_RANGE, CUSTOMER, PROJECT, ACCOUNT, REPO } from '../../../config';
import { SecretsManager } from '../SecretsManager';
import { Scope } from 'aws-cdk-lib/aws-ecs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { Environment } from '../../../types';

export class CodePipeline extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
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
    let autoDeleteObjects;
    let branch;
    let command;

    switch (env) {
      case Environment.DEV:
        branch = 'dev';
        command = 'dev';
        autoDeleteObjects = true;
        break;
      case Environment.TEST:
        branch = 'test';
        command = 'test';
        autoDeleteObjects = true;
        break;
      case Environment.PROD:
        branch = 'main';
        command = 'prod';
        autoDeleteObjects = false;
        break;
    }
    const pipelineArtifactBucket = new s3.Bucket(this, `PipelineArtifactBucket${env}`, {
      bucketName: `${PROJECT}-ci-cd-artifact-bucket-${env}`.toLowerCase(),
      removalPolicy:
        env === Environment.PROD ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // Or DESTROY for dev environments
      autoDeleteObjects: autoDeleteObjects,
    });

    // artefacto para guardar el código fuente que se va a desplegar. Es output de el stage de GitHub e input del resto de stages.
    const pipelineSourceArtifact = new codepipeline.Artifact();

    // stage 1 para clonar el repositorio
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHubAccess',
      owner: 'prevalentWare',
      repo: REPO,
      branch: branch,
      oauthToken: secret.secretValue,
      output: pipelineSourceArtifact,
    });

    const sourceStage: cdk.aws_codepipeline.StageProps = {
      stageName: 'RepoSource',
      actions: [sourceAction],
    };

    // stage 2 para build
    const lintProject = new codebuild.PipelineProject(
      this,
      `${CUSTOMER}-${PROJECT}-lintproject-${env}`,
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
                'npm i -g bun',
                'cd api',
                'bun install',
              ],
            },
            post_build: {
              commands: ['echo ejecutando el linter...', 'bun lint'],
            },
          },
        }),
      }
    );

    const lintAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'lintApplication',
      input: pipelineSourceArtifact,
      project: lintProject,
    });

    const lintStage: cdk.aws_codepipeline.StageProps = {
      stageName: `Lint-${env}`,
      actions: [lintAction],
    };

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
                'npm i -g bun',
                'bun install',
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
              commands: [
                'echo Desplegando el aplicativo...',
                // `bun run deploy:${env === Environment.PROD ? 'prod' : 'dev'}`,
                `bun run deploy:${command}`,
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
      stages: [sourceStage, lintStage, deployStage],
    });
  }
}
