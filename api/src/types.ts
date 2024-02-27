import { Prisma, PrismaClient, Role, Session, User } from '@prisma/client';
import type { APIGatewayProxyEvent } from 'aws-lambda';

type db = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>;

interface customEvent extends APIGatewayProxyEvent {
  session:
    | (Session & {
        user: User & {
          role: Role | null;
        };
      })
    | null;
}

interface Context {
  db: db;
  // sessionToken: string | undefined;
  // user: (User & { role: Role | null }) | undefined;
  session:
    | (Session & {
        user: User & {
          role: Role | null;
        };
      })
    | null;
}

interface ResolverFunction {
  [key: string]: (parent: any, args: any, context: Context) => Promise<any>;
}

interface Resolver {
  Query: ResolverFunction;
  Mutation: ResolverFunction;
  [key: string]: ResolverFunction;
}

export { Resolver, db, customEvent, Context };
