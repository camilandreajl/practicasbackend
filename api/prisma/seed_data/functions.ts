import { PrismaClient } from '@prisma/client';

const functions = async (prisma: PrismaClient) => {
  await prisma.$queryRaw`
    CREATE OR REPLACE FUNCTION listar_usuarios()
    RETURNS text
    LANGUAGE plpgsql
    AS $function$
    SELECT * FROM user
    end;
    $function$
    ;
  `;
};

export { functions };
