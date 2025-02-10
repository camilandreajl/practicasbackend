import { Resolver } from "@/types";
import { Session } from "@prisma/client";

const roleResolvers: Resolver = {
  //findunique solo me deja buscar por un campo unico como Id
  Role:{
    users: async (parent, args, context) => {
        return await context.db.user.findMany({
            where: { roleId: {
                equals: parent.id
            } }
        });
    },
  


  },

    Query: {        
        getRoles: async (parent, args, context) => {
         try {
           // Fetch users from the database
           return await context.db.role.findMany();
         } catch (error) {
           console.error('Error fetching roless:', error);
           throw new Error('Failed to fetch roles');
         }
       },
},

//siempre va el tipo query y mutation asi este vacío
Mutation: { 
    
}
}

export {roleResolvers};