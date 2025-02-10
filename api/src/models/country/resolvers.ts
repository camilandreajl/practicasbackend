import { Resolver } from '@/types';
import { User } from '@prisma/client';

const countryResolvers: Resolver = {
  //findunique solo me deja buscar por un campo unico como Id
  Country: {
    users: async (parent, args, context) => {
      console.log('parent :>> ', parent);
      return await context.db.user.findMany({
        where: {
          Country: {
            some: {
              id: {
                equals: parent.id,
              },
            },
          },
        },
      });
    },
  },

  Query: {
    getCountries: async (parent, args, context) => {
      try {
        // Fetch users from the database
        return await context.db.country.findMany();
      } catch (error) {
        console.error('Error fetching countries:', error);
        throw new Error('Failed to fetch countries');
      }


    },
  },

  //siempre va el tipo query y mutation asi este vacío
  Mutation: {},
};

export { countryResolvers };
