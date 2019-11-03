// @flow

import clientSchema from './graphql/schema';

export default function createInitialState(data: Object) {
  return {
    ...clientSchema.defaults,
    ...data,
  };
}
