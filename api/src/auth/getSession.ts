  const getSession=async(db:any, sessionToken:any)=>{
    const session = await db.session.findFirst({
        where: { sessionToken: sessionToken ?? "" },
        select: {
          expires:true,
          user: {
            select: {
              role: true,
            },
          },
        },
      });
     return session
  }

  export {getSession}