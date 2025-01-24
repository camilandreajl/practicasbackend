import { PrismaClient } from '@prisma/client';

export async function updateSessions() {
  const prisma = new PrismaClient();
  try {
    await prisma.session.updateMany({
      data: {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });
  } finally {
    await prisma.$disconnect();
  }
} 