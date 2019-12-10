// @flow

import { merge } from '../../../core/graphql/graphqlDef';

import Apollo from './Apollo/schema';
import Database from './Database/schema';
import Scalar from './Scalar/schema';

export default merge(Apollo, Database, Scalar);
