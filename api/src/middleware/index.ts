import { corsMiddleware } from './cors';
import { handlers } from '@as-integrations/aws-lambda';

export const requestHandler =
  handlers.createAPIGatewayProxyEventRequestHandler();

export const middlewareFunctions = [corsMiddleware];
