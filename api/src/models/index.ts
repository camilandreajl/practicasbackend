// Resolvers
import { generalResolvers } from './general/resolvers';
// import { accountResolvers } from './account/resolvers';
// import { sessionResolvers } from './session/resolvers';
// import { userResolvers } from './user/resolvers';
// import { roleResolvers } from './role/resolvers';
// Types Defs
import { generalTypes } from './general/types';
// import { accountTypes } from './account/types';
// import { sessionTypes } from './session/types';
// import { userTypes } from './user/types';
// import { roleTypes } from './role/types';
import { Enum_ResolverType, Resolver } from '@/types';
import { withSessionCheck } from '@/auth/withSessionCheck';
import {
  resolverArray as cosmoResolvers,
  typesArray as cosmoTypes,
} from 'prisma/generated/models';
import { userMonitoringTypes } from './userMonitoring/types';
import { sessionTypes } from './session/types';
import { roleTypes } from './roles/types';
import { countryTypes } from './country/types';
import { userTypes } from './users/types';
import { userResolvers } from './users/resolvers';

const resolverArray: Resolver[] = [
  generalResolvers,
  userResolvers,
  ...cosmoResolvers,
].map((el) => {
  const mappedResolver: Resolver = { Query: {}, Mutation: {} };

  Object.keys(el).forEach((key) => {
    const resolverObj = el[key];

    let resolverName = Enum_ResolverType.Parent;
    if (key === 'Query') resolverName = Enum_ResolverType.Query;
    if (key === 'Mutation') resolverName = Enum_ResolverType.Mutation;

    // Object.keys(resolverObj).forEach((resolverKey) => {
    //   resolverObj[resolverKey] = withSessionCheck(
    //     resolverObj[resolverKey],
    //     resolverKey,
    //     resolverName
    //   );
    // });
    mappedResolver[key] = resolverObj;
  });

  return el;
});

const typesArray = [
  generalTypes,
  userMonitoringTypes,
  userTypes, 
  sessionTypes,
  roleTypes,
  countryTypes,
  // accountTypes,
  // sessionTypes,
  // userTypes,
  // roleTypes,
  ...cosmoTypes,
];

export { resolverArray, typesArray };
