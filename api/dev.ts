import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { resolverArray, typesArray } from './src/models';
import { getDB } from './src/db';
import { getSession } from './src/auth/getSession';


const main = async () => {
	const db = await getDB();
	const server = new ApolloServer({
		typeDefs: typesArray,
		resolvers: resolverArray,
		introspection: true,
	});
	const { url } = await startStandaloneServer(server, {
		context: async (e: any) => ({
			db,
			session: await getSession(db, e.req.headers['next-auth.session-token']),
		}),
	});
	console.log(`🚀 Server ready at ${url}`);
};

main();
