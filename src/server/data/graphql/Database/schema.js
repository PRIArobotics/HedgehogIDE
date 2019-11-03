// @flow

import { merge } from '../../../../core/graphql/graphqlDef';

import GetAllUsers from './users/GetAllUsers';
import GetLoggedInUser from './users/GetLoggedInUser';
import CreateUser from './users/CreateUser';

export default merge(GetAllUsers, GetLoggedInUser, CreateUser);
