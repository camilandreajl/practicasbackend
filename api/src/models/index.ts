// Resolvers
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

const resolverArray = [accountResolvers, sessionResolvers, userResolvers, roleResolvers];
const typesArray = [generalTypes, accountTypes, sessionTypes, userTypes, roleTypes];

export { resolverArray, typesArray };
