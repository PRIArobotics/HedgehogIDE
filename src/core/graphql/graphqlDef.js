// @flow

import lodashMerge from 'lodash.merge';
import { PubSub } from 'graphql-subscriptions';

export type GraphqlDef = {|
  schema: Array<string>,
  queries: Array<string>,
  mutations: Array<string>,
  subscriptions: Array<string>,
  resolvers: (pubsub: PubSub) => Object,
  defaults: Object,
|};

export type GraphqlDefShape = {|
  +schema?: Array<string>,
  +queries?: Array<string>,
  +mutations?: Array<string>,
  +subscriptions?: Array<string>,
  +resolvers?: (pubsub: PubSub) => Object,
  +defaults?: Object,
|};

// eslint-disable-next-line no-unused-vars
const dummyResolver = (pubsub: PubSub) => ({});

// eslint-disable-next-line import/prefer-default-export
export function merge(...defs: Array<GraphqlDefShape>): GraphqlDef {
  return {
    schema: [].concat(...defs.map(def => def.schema || [])),
    queries: [].concat(...defs.map(def => def.queries || [])),
    mutations: [].concat(...defs.map(def => def.mutations || [])),
    subscriptions: [].concat(...defs.map(def => def.subscriptions || [])),
    resolvers: (pubsub: PubSub) =>
      lodashMerge(...defs.map(def => (def.resolvers || dummyResolver)(pubsub))),
    defaults: lodashMerge(...defs.map(def => def.defaults || {})),
  };
}
