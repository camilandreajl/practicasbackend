import { PrismaClient } from '@prisma/client';

const users = [
  {
    id: 'cl95p1b320000tq58mtpcq3al',
    email: 'dev@prevalentware.com',
    image: '',
    name: 'UserDev',
    roleId: 'admin_role',
  },
];

const seedUsers = async (prisma: PrismaClient) => {
  const role = await prisma.role.findFirst({
    where: { name: 'Admin' },
  });

  if (!role) {
    throw new Error('Required role not found in database');
  }

  await prisma.user.createMany({
    data: users.map(user => ({
      ...user,
      roleId: role.id,
    })),
    skipDuplicates: true,
  });
};

export { seedUsers };