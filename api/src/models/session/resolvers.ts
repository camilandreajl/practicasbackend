import { Resolver } from '@/types';
import { sessionDataLoader } from './dataLoaders';
import { checkSession } from '@/auth/checkSession';

const sessionResolvers: Resolver = {
  Session: {
    user: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'user',
        resolverType: 'Parent',
      });
      if (check?.auth) {
        sessionDataLoader.userLoader.clearAll();
        return await sessionDataLoader.userLoader.load(parent.userId);
      }
      return null;
    },
  },
  Query: {
    sessions: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'sessions',
        resolverType: 'Query',
      });
      if (check?.auth) {
        return await db.session.findMany({});
      }
      return Error(check?.error);
    },
    session: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'session',
        resolverType: 'Query',
      });
      if (check?.auth) {
        return await db.session.findUnique({
          where: {
            id: args.id,
          },
        });
      }
      return Error(check?.error);
    },
  },
  Mutation: {
    createSession: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'createSession',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.session.create({
          data: {
            ...args.data,
            expires: new Date(args.data.expires).toISOString(),
          },
        });
      }
      return Error(check?.error);
    },
    updateSession: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'updateSession',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.session.update({
          where: {
            id: args.where.id,
          },
          data: {
            ...args.data,
            ...(args.data.expires && {
              expires: new Date(args.data.expires).toISOString(),
            }),
          },
        });
      }
      return Error(check?.error);
    },
    upsertSession: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'upsertSession',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.session.upsert({
          where: {
            id: args.where.id,
          },
          create: {
            ...args.data,
            expires: new Date(args.data.expires).toISOString(),
          },
          update: {
            ...args.data,
            ...(args.data.expires && {
              expires: new Date(args.data.expires).toISOString(),
            }),
          },
        });
      }
      return Error(check?.error);
    },

    deleteSession: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'deleteSession',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.session.delete({
          where: {
            id: args.where.id,
          },
        });
      }
      return Error(check?.error);
    },
  },
};
export { sessionResolvers };
