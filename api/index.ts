import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getDB } from './src/db';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { getSession } from './src/auth/getSession';
import { resolverArray, typesArray } from './src/models';
import { Context } from '@/types';

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({
  typeDefs: typesArray,
  resolvers: resolverArray,
});

export const server = new ApolloServer<Context>({
  schema: schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const main = async () => {
  await server.start();

  app.get('/healthcheck', (req, res) => {
    return res.status(200).send('OK');
  });

  app.use(
    '/',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => {
        const db = await getDB();
        const sessionToken: string | string[] | undefined = req.headers['next-auth.session-token'];
        const session = await getSession(db, sessionToken as string);
        return { db, session };
      },
    })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 80 }, resolve));

  console.log(`🚀 Server ready and running!`);
};

main();
