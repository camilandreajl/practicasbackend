import { db } from '@/types';

const getSession = async (db: db, sessionToken: string | undefined) => {
  const session = await db.session.findFirst({
    where: { sessionToken: sessionToken ?? '' },
    select: {
      expires: true,
      user: {
        select: {
          role: true,
        },
      },
    },
  });
  return session;
};

export { getSession };
