import { Resolver } from '@/types';
import { accountDataLoader } from './dataLoaders';
import { checkSession } from '@/auth/checkSession';

const accountResolvers: Resolver = {
  Account: {
    user: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'user',
        resolverType: 'Parent',
      });
      if (check?.auth) {
        accountDataLoader.userLoader.clearAll();
        return await accountDataLoader.userLoader.load(parent.userId);
      }
      return null;
    },
  },
  Query: {
    accounts: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'accounts',
        resolverType: 'Query',
      });
      if (check?.auth) {
        return await db.account.findMany({});
      }
      return Error(check?.error);
    },
    account: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'account',
        resolverType: 'Query',
      });
      if (check?.auth) {
        return await db.account.findUnique({
          where: {
            id: args.id,
          },
        });
      }
      return Error(check?.error);
    },
  },
  Mutation: {
    createAccount: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'createAccount',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.account.create({
          data: { ...args.data },
        });
      }
      return Error(check?.error);
    },
    updateAccount: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'updateAccount',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.account.update({
          where: {
            id: args.where.id,
          },
          data: { ...args.data },
        });
      }
      return Error(check?.error);
    },
    upsertAccount: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'upsertAccount',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.account.upsert({
          where: {
            id: args.where.id,
          },
          create: { ...args.data },
          update: { ...args.data },
        });
      }
      return Error(check?.error);
    },

    deleteAccount: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'deleteAccount',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.account.delete({
          where: {
            id: args.where.id,
          },
        });
      }
      return Error(check?.error);
    },
  },
};
export { accountResolvers };
