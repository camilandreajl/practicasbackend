import { Enum_RoleName, PrismaClient, Role } from '@prisma/client';
import type { APIGatewayProxyEvent } from 'aws-lambda';

type db = PrismaClient;

interface customEvent extends APIGatewayProxyEvent {
  session: Session;
}

export type Session = {
  expires: Date;
  user: {
    id: string;
    role: Role;
  };
} | null;

export interface Context {
  db: PrismaClient;
  session: {
    user: {
      id: string;
      role: {
        id: string;
        name: Enum_RoleName;
        createdAt: Date;
        updatedAt: Date;
      };
    };
    expires: Date | null;
  } | null;
}

export type ResolverFunction = (
  parent: any,
  args: any,
  context: Context
) => Promise<unknown>;

interface Resolver {
  Query: { [key: string]: ResolverFunction };
  Mutation: { [key: string]: ResolverFunction };
  [key: string]: { [key: string]: ResolverFunction };
}

export enum Enum_ResolverType {
  Query = 'Query',
  Mutation = 'Mutation',
  Parent = 'Parent',
}

export { Resolver, db, customEvent };
