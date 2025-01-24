import { PrismaClient, Enum_RoleName } from '@prisma/client';

const roles = [
  {
    id: 'admin_role',
    name: Enum_RoleName.Admin,
    description: 'Administrator role with full access',
  },
];

const seedRoles = async (prisma: PrismaClient) => {
  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true,
  });
};

export { seedRoles }; 