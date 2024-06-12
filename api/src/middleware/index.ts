import { corsMiddleware } from './cors';
import { handlers } from '@as-integrations/aws-lambda';

export const requestHandler =
  handlers.createAPIGatewayProxyEventV2RequestHandler();

export const middlewareFunctions = [corsMiddleware];
