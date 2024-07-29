import { Resolver } from '@/types';
import { sessionDataLoader } from './dataLoaders';

const sessionResolvers: Resolver = {
  Session: {
    user: async (parent, args, { db, session }) => {
      sessionDataLoader.userLoader.clearAll();
      return await sessionDataLoader.userLoader.load(parent.userId);
    },
  },
  Query: {
    sessions: async (parent, args, { db, session }) => {
      return await db.session.findMany({});
    },
    session: async (parent, args, { db, session }) => {
      return await db.session.findUnique({
        where: {
          id: args.id,
        },
      });
    },
  },
  Mutation: {
    createSession: async (parent, args, { db, session }) => {
      return await db.session.create({
        data: {
          ...args.data,
          expires: new Date(args.data.expires).toISOString(),
        },
      });
    },
    updateSession: async (parent, args, { db, session }) => {
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
    },
    upsertSession: async (parent, args, { db, session }) => {
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
    },

    deleteSession: async (parent, args, { db, session }) => {
      return await db.session.delete({
        where: {
          id: args.where.id,
        },
      });
    },
  },
};
export { sessionResolvers };
