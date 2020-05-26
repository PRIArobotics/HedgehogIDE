// @flow

import { merge } from '../../../core/graphql/graphqlDef';

import Database from './Database/schema';
import Scalar from './Scalar/schema';

export default merge(Database, Scalar);
