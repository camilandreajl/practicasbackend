import { default as DataLoader } from 'dataloader';
import { User } from '@prisma/client';
import { getDB } from '@/db';

//one to many
const userLoader =
  () =>
  async (ids: readonly string[]): Promise<(User | undefined)[]> => {
    const db = await getDB();
    const user = await db.user.findMany({
      where: {
        id: { in: [...ids] },
      },
    });
    return ids.map((id) => {
      return user.find((user) => user.id == id);
    });
  };

const accountDataLoader = {
  userLoader: new DataLoader<string, User | undefined>(userLoader()),
};
export { accountDataLoader };
