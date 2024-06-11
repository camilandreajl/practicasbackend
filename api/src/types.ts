import { Enum_RoleName, PrismaClient } from '@prisma/client';
import type { APIGatewayProxyEvent } from 'aws-lambda';

type db = PrismaClient;

interface customEvent extends APIGatewayProxyEvent {
  session: Session;
}

export type Session = {
  expires: Date;
  user: {
    id: string;
    role: {
      id: string;
      name: Enum_RoleName;
      createdAt: Date;
      updatedAt: Date;
    };
  };
} | null;

interface Context {
  db: db;
  Session: Session;
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
