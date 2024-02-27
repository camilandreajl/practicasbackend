import { accountResolvers } from './account/resolvers';
import { sessionResolvers } from './session/resolvers';
import { userResolvers } from './user/resolvers';
import { roleResolvers } from './role/resolvers';

const resolverArray = [accountResolvers, sessionResolvers, userResolvers, roleResolvers];
export default resolverArray;
