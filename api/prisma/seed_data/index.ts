import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedRoles } from './roles';

export const seedDatabase = async (prisma: PrismaClient) => {
  // Seed roles first
  await seedRoles(prisma);
  // Then seed users
  await seedUsers(prisma);
};
