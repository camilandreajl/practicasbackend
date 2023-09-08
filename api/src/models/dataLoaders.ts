import { accountDataLoader } from './account/dataLoaders';
import { sessionDataLoader } from './session/dataLoaders';
import { userDataLoader } from './user/dataLoaders';
import { roleDataLoader } from './role/dataLoaders';

const dataLoadersArray = [
  accountDataLoader,
  sessionDataLoader,
  userDataLoader,
  roleDataLoader,
];
export default dataLoadersArray;
