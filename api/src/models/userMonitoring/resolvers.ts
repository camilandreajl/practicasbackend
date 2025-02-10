import { Resolver } from "@/types";
import { UserMonitoring } from "@prisma/client";

const userMonitoringResolvers: Resolver = {
  //findunique solo me deja buscar por un campo unico como Id
  UserMonitoring:{
    user: async (parent, args, context) => {
        return await context.db.user.findUnique({
            where: { id: parent.userId }
        });
    },

  


  },

    Query: {        
        getUserMonitorings: async (parent, args, context) => {
         try {
           // Fetch users from the database
           return await context.db.userMonitoring.findMany();
         } catch (error) {
           console.error('Error fetching user monitorings:', error);
           throw new Error('Failed to fetch user monitorings');
         }
       },
       getTopUsersWithMonitoringRecords : async (parent, args, context) => {
        const result = await context.db.user.findMany({
          where: {
            role: { name: "Admin" }, // Filtra solo usuarios con rol "Admin"
            UserMonitoring: {
              some: {
                createdAt: {
                  gte: args.startDate, // Fecha de inicio
                  lte: args.endDate,   // Fecha de fin
                },
              },
            },
           
           
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: { UserMonitoring: true }, // Cuenta los registros en UserMonitoring
            },
          },
          orderBy: {
            UserMonitoring: { _count: "desc" }, // Ordena por cantidad de registros en UserMonitoring
          },
          take: 3, // Solo devuelve los 3 primeros usuarios
        });
      
        return result;
      },
      getTopUsersByCountry : async (parent, args, context) => {
        const result = await context.db.user.findMany({
          where: {
            role: { name: "Admin" }, // Filtra solo usuarios con rol "Admin"
            Country: {
                some: { id: args.countryId } 
            },
            UserMonitoring: {
              some: {
                createdAt: {
                  gte: args.startDate, // Fecha de inicio
                  lte: args.endDate,   // Fecha de fin
                },
                description: args.description
              },
           
           
          }},
          select: {
            id: true,
            name: true,
            _count: {
              select: { UserMonitoring: true }, // Cuenta los registros en UserMonitoring
            },
          },
          orderBy: {
            UserMonitoring: { _count: "desc" }, // Ordena por cantidad de registros en UserMonitoring
          },
          take: 3, // Solo devuelve los 3 primeros usuarios
        });
      
        return result;
      },


    
// en SQL 
// select um."userId" ,  COUNT(um.id) as total
// from "UserMonitoring" as um
// join "_CountryToUser" ctu on ctu."B" = um."userId" 
// join "User" as us on us.id = um."userId" 
// join "Role" as r on us."roleId" = r.id
// where ctu."A" = '1' 
// and us."roleId" = 'cm5wzih14000014hknlzbkfqb'
// and um.description = 'logout'
// and um."createdAt" BETWEEN '2025-02-07' AND '2025-02-10' 
// group by um."userId" 
// order by total desc
// limit 3
},

//siempre va el tipo query y mutation asi este vacío
Mutation: { 
    
}
}

export { userMonitoringResolvers };