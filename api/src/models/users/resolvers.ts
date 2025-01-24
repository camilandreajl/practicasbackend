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
        where: { userId: parent.id }
      })
    },
    countries: async (parent,args,context) => {
      return await context.db.country.findMany({
        where: { User: { some: { id: parent.id } } }
      })
    }
  },
    Query: {        
    getUsers: async (parent, args, context) => {
         try {
           // Fetch users from the database
           return await context.db.user.findMany();
         } catch (error) {
           console.error('Error fetching users:', error);
           throw new Error('Failed to fetch users');
         }
       },
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
