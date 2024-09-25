// Resolvers
import { generalResolvers } from './general/resolvers';
import { accountResolvers } from './account/resolvers';
import { sessionResolvers } from './session/resolvers';
import { userResolvers } from './user/resolvers';
import { roleResolvers } from './role/resolvers';
// Types Defs
import { generalTypes } from './general/types';
import { accountTypes } from './account/types';
import { sessionTypes } from './session/types';
import { userTypes } from './user/types';
import { roleTypes } from './role/types';
import { Enum_ResolverType, Resolver } from '@/types';
import { withSessionCheck } from '@/auth/withSessionCheck';
import {
  resolverArray as cosmoResolvers,
  typesArray as cosmoTypes,
} from 'prisma/generated/models';

const resolverArray = [
  generalResolvers,
  accountResolvers,
  sessionResolvers,
  userResolvers,
  roleResolvers,
  ...cosmoResolvers,
].map((el) => {
  const mappedResolver: Resolver = { Query: {}, Mutation: {} };

  Object.keys(el).forEach((key) => {
    const resolverObj = el[key];

    let resolverName = Enum_ResolverType.Parent;
    if (key === 'Query') resolverName = Enum_ResolverType.Query;
    if (key === 'Mutation') resolverName = Enum_ResolverType.Mutation;

    Object.keys(resolverObj).forEach((resolverKey) => {
      resolverObj[resolverKey] = withSessionCheck(
        resolverObj[resolverKey],
        resolverKey,
        resolverName
      );
    });
    mappedResolver[key] = resolverObj;
  });

  return el;
});

const typesArray = [
  generalTypes,
  accountTypes,
  sessionTypes,
  userTypes,
  roleTypes,
  ...cosmoTypes,
];

export { resolverArray, typesArray };
