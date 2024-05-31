import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import { getDB } from './db';
import { getSession } from './auth/getSession';

import { resolverArray, typesArray } from './models';
import { middlewareFunctions } from './middleware';
import { Context } from './types';

const server = new ApolloServer<Context>({
  typeDefs: typesArray,
  resolvers: resolverArray,
  introspection: true,
});

const apiGatewayHandler = handlers.createAPIGatewayProxyEventRequestHandler();
export const handler = startServerAndCreateLambdaHandler(server, apiGatewayHandler, {
  context: async ({ event }) => {
    const db = await getDB();
    const sessionToken: string | undefined = event.headers['next-auth.session-token'];
    const session = await getSession(db, sessionToken);
    return { db, session };
  },
  middleware: middlewareFunctions,
});
