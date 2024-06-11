import { db } from '@/types';

const getSession = async (db: db, sessionToken: string | undefined) => {
  const session = await db.session.findFirst({
    where: { sessionToken: sessionToken ?? '' },
    select: {
      expires: true,
      user: {
        select: {
          role: true,
          id: true,
        },
      },
    },
  });
  if (!session) {
    throw new Error('Session not found');
  }
  return session;
};

export { getSession };
