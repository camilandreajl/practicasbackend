import type { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { handlers, middleware } from '@as-integrations/aws-lambda';

const corsMiddleware: middleware.MiddlewareFn<
  handlers.RequestHandler<APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2>
> = async (event) => {
  return async (result) => {
    console.log('checking cors');
    result.headers = {
      ...result.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': '*',
    };
  };
};

export { corsMiddleware };
