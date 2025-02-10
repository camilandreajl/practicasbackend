import { Resolver } from "@/types";
import { User } from "@prisma/client";

const userResolvers: Resolver = {
  //findunique solo me deja buscar por un campo unico como Id
  User:{
    role: async (parent, args, context) => {
      console.log('parent :>> ',parent);
        return await context.db.role.findUnique({
            where: { id: parent.roleId }
        });
    },
    userMonitorings: async (parent, args, context) => {
      return await context.db.userMonitoring.findMany({
        where: { userId: 
          {
            equals: parent.id
          }
        }
      })
    },
    // countries: async (parent,args,context) => {
    //   return await context.db.country.findMany({
    //     where: { User: 
    //       { 

    //         some: { 
    //           id:  {
    //             equals: parent.id
    //           }
    //         } 
    //       } 
    //     }
    //   })
    // },
    //CON SQL
    countries: async (parent,args,context) => {
      console.log('parent :>> ',parent);
      const result = await context.db.$queryRaw`
      select *  from "Country" c 
      join "_CountryToUser" ctu ON 
      c.id = ctu."A" 
      where ctu."B" = ${parent.id}
      `
      console.log('result :>> ',result);
      return result
    },
    sessions: async (parent,args,context) => {
      return await context.db.session.findMany({

        where: { userId: parent.id }
      })
    }

  },

    Query: {   
      getUser: async (parent, args, context) => {
        try {
          // Fetch users from the database
          return await context.db.user.findUnique(
            {
              where: {
                email: args.email
              }
            }
          );
        } catch (error) {
          console.error('Error fetching user:', error);
          throw new Error('Failed to fetch user');
        }
      },     
    getUsers: async (parent, args, context) => {
         try {
           // Fetch users from the database
           return await context.db.user.findMany();
         } catch (error) {
           console.error('Error fetching users:', error);
           throw new Error('Failed to fetch users');
         }
       },
    getTopUsers: async (parent, args, context) => {
      try {
        // Fetch users from the database
        return await context.db.user.findMany();
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    }
    //getUser(email: String!): User
    // topUsers(
    //     startDate: DateTime!,
    //     endDate: DateTime!
    // ): [User]
    // topUsersByCountry(
    //     monitoringType: Enum_UserMonitoringType!,
    //     countryId: String!,
    //     startDate: DateTime!,
    //     endDate: DateTime!,
    // ): [User]
},

//siempre va el tipo query y mutation asi este vacío
Mutation: { 
    
}
}

export { userResolvers };
