import { middleware } from '@as-integrations/aws-lambda';
import { requestHandler } from '.';

const corsMiddleware: middleware.MiddlewareFn<
  typeof requestHandler
> = async () => {
  return async (result) => {
    result.headers = {
      ...result.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': '*',
    };
  };
};

export { corsMiddleware };
