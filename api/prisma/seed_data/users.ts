import { PrismaClient } from '@prisma/client';

const users = [
  {
    id: 'cl95p1b320000tq58mtpcq3al',
    email: 'dev@prevalentware.com',
    image:
      '',
    name: 'UserDev',
    roleId: '',
  },
];

const seedUsers = async (prisma: PrismaClient) => {
  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
};

export { seedUsers };