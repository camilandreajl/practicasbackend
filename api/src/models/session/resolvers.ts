import { Resolver } from "@/types";
import { Session } from "@prisma/client";

const sessionResolvers: Resolver = {
  //findunique solo me deja buscar por un campo unico como Id
  Session:{
    user: async (parent, args, context) => {
        return await context.db.user.findUnique({
            where: { id: parent.userId }
        });
    },
  


  },

    Query: {        
        getSessions: async (parent, args, context) => {
         try {
           // Fetch users from the database
           return await context.db.session.findMany();
         } catch (error) {
           console.error('Error fetching sessions:', error);
           throw new Error('Failed to fetch sessions');
         }
       },
},

//siempre va el tipo query y mutation asi este vacío
Mutation: { 
    
}
}

export { sessionResolvers };