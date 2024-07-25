import { Resolver } from '@/types';
import { roleDataLoader } from './dataLoaders';

const roleResolvers: Resolver = {
  Role: {
    users: async (parent, args, { db, session }) => {
      roleDataLoader.usersLoader.clearAll();
      return await roleDataLoader.usersLoader.load(parent.id);
    },
  },
  Query: {
    roles: async (parent, args, { db, session }) => {
      return await db.role.findMany({});
    },
    role: async (parent, args, { db, session }) => {
      return await db.role.findUnique({
        where: {
          id: args.id,
        },
      });
    },
  },
  Mutation: {
    createRole: async (parent, args, { db, session }) => {
      return await db.role.create({
        data: { ...args.data },
      });
    },
    updateRole: async (parent, args, { db, session }) => {
      return await db.role.update({
        where: {
          id: args.where.id,
        },
        data: { ...args.data },
      });
    },
    upsertRole: async (parent, args, { db, session }) => {
      return await db.role.upsert({
        where: {
          id: args.where.id,
        },
        create: { ...args.data },
        update: { ...args.data },
      });
    },

    deleteRole: async (parent, args, { db, session }) => {
      return await db.role.delete({
        where: {
          id: args.where.id,
        },
      });
    },
  },
};
export { roleResolvers };
