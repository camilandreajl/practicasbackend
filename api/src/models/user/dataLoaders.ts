import { default as DataLoader } from 'dataloader';
import { Account, Session, Role } from '@prisma/client';
import { getDB } from '@/db';

//one to one
const accountLoader =
  () =>
  async (ids: readonly string[]): Promise<(Account | undefined)[]> => {
    const db = await getDB();
    const account = await db.account.findMany({
      where: {
        userId: { in: [...ids] },
      },
    });
    return ids.map((id) => {
      return account.find((account) => account.userId == id);
    });
  };
//many to one

const sessionsLoader =
  () =>
  async (ids: readonly string[]): Promise<(Session[] | undefined)[]> => {
    const db = await getDB();
    const sessions = await db.session.findMany({
      where: {
        user: {
          is: {
            id: { in: [...ids] },
          },
        },
      },
    });
    return ids.map((id) => {
      return sessions.filter((i) => i.userId == id);
    });
  };
//one to many
const roleLoader =
  () =>
  async (ids: readonly string[]): Promise<(Role | undefined)[]> => {
    const db = await getDB();
    const role = await db.role.findMany({
      where: {
        id: { in: [...ids] },
      },
    });
    return ids.map((id) => {
      return role.find((role) => role.id == id);
    });
  };

const userDataLoader = {
  accountLoader: new DataLoader<string, Account | undefined>(accountLoader()),
  sessionsLoader: new DataLoader<string, Session[] | undefined>(
    sessionsLoader()
  ),
  roleLoader: new DataLoader<string, Role | undefined>(roleLoader()),
};
export { userDataLoader };
