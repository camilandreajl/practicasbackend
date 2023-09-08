import { Resolver } from '../../types';
import { roleDataLoader } from './dataLoaders';
import { checkSession } from '../../auth/checkSession';

const roleResolvers: Resolver = {
  Role: {
    users: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'users',
        resolverType: 'Parent',
      });
      if (check?.auth) {
        roleDataLoader.usersLoader.clearAll();
        return await roleDataLoader.usersLoader.load(parent.id);
      }
      return null;
    },
  },
  Query: {
    roles: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'roles',
        resolverType: 'Query',
      });
      if (check?.auth) {
        return await db.role.findMany({});
      }
      return Error(check?.error);
    },
    role: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'role',
        resolverType: 'Query',
      });
      if (check?.auth) {
        return await db.role.findUnique({
          where: {
            id: args.id,
          },
        });
      }
      return Error(check?.error);
    },
  },
  Mutation: {
    createRole: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'createRole',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.role.create({
          data: { ...args.data },
        });
      }
      return Error(check?.error);
    },
    updateRole: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'updateRole',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.role.update({
          where: {
            id: args.where.id,
          },
          data: { ...args.data },
        });
      }
      return Error(check?.error);
    },
    upsertRole: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'upsertRole',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.role.upsert({
          where: {
            id: args.where.id,
          },
          create: { ...args.data },
          update: { ...args.data },
        });
      }
      return Error(check?.error);
    },

    deleteRole: async (parent, args, { db, session }) => {
      const check = await checkSession({
        session,
        resolverName: 'deleteRole',
        resolverType: 'Mutation',
      });
      if (check?.auth) {
        return await db.role.delete({
          where: {
            id: args.where.id,
          },
        });
      }
      return Error(check?.error);
    },
  },
};
export { roleResolvers };
