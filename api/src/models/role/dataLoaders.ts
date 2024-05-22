import { default as DataLoader } from 'dataloader';
import { User } from '@prisma/client';
import { getDB } from '@/db';

//many to one

const usersLoader =
  () =>
  async (ids: readonly string[]): Promise<(User[] | undefined)[]> => {
    const db = await getDB();
    const users = await db.user.findMany({
      where: {
        role: {
          is: {
            id: { in: [...ids] },
          },
        },
      },
    });
    return ids.map((id) => {
      return users.filter((i) => i.roleId == id);
    });
  };

const roleDataLoader = {
  usersLoader: new DataLoader<string, User[] | undefined>(usersLoader()),
};
export { roleDataLoader };
