import merge from 'lodash.merge';

/** * Queries ** */
import {
  schema as ApolloSchema,
  queries as ApolloQueries,
  mutations as ApolloMutations,
  subscriptions as ApolloSubscriptions,
  resolvers as ApolloResolvers,
} from './apollo';

export const schema = [...ApolloSchema];

export const queries = [...ApolloQueries];

export const mutations = [...ApolloMutations];

export const subscriptions = [...ApolloSubscriptions];

export const resolvers = pubsub => merge(ApolloResolvers(pubsub));
