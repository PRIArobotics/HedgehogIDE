// @flow

import { merge } from '../../../core/graphql/graphqlDef';

import User from './User';
import Project from './Project';

export default merge(User, Project);
