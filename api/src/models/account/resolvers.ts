import { Resolver } from '@/types';
import { accountDataLoader } from './dataLoaders';

const accountResolvers: Resolver = {
  Account: {
    user: async (parent, args, { db, session }) => {
      accountDataLoader.userLoader.clearAll();
      return await accountDataLoader.userLoader.load(parent.userId);
    },
  },
  Query: {
    accounts: async (parent, args, { db, session }) => {
      return await db.account.findMany({});
    },
    account: async (parent, args, { db, session }) => {
      return await db.account.findUnique({
        where: {
          id: args.id,
        },
      });
    },
  },
  Mutation: {
    createAccount: async (parent, args, { db, session }) => {
      return await db.account.create({
        data: { ...args.data },
      });
    },
    updateAccount: async (parent, args, { db, session }) => {
      return await db.account.update({
        where: {
          id: args.where.id,
        },
        data: { ...args.data },
      });
    },
    upsertAccount: async (parent, args, { db, session }) => {
      return await db.account.upsert({
        where: {
          id: args.where.id,
        },
        create: { ...args.data },
        update: { ...args.data },
      });
    },

    deleteAccount: async (parent, args, { db, session }) => {
      return await db.account.delete({
        where: {
          id: args.where.id,
        },
      });
    },
  },
};
export { accountResolvers };
