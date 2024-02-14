import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { getDB } from './src/db';
import resolverArray from './src/models/index';
import { getSession } from './src/auth/getSession';

getSession

const typeDefs = readFileSync(require.resolve('./graphql/schema.graphql')).toString('utf-8');

const AWSTypes = `
scalar AWSDateTime
scalar AWSJSON
`;

const main = async () => {
  const db = await getDB();
  const server = new ApolloServer({
    typeDefs: `${AWSTypes} ${typeDefs}`,
    resolvers: resolverArray,
  });
  const { url } = await startStandaloneServer(server, { context: async (e:any) => ({ db, session:await getSession(db, e.req.headers['next-auth.session-token']) }) });
  console.log(`🚀 Server ready at ${url}`);
};

main();