import merge from 'lodash.merge';

/** * Queries ** */
import {
  schema as ApolloSchema,
  queries as ApolloQueries,
  mutations as ApolloMutations,
  resolvers as ApolloResolvers,
} from './apollo';

export const schema = [...ApolloSchema];

export const queries = [...ApolloQueries];

export const mutations = [...ApolloMutations];

export const resolvers = merge(ApolloResolvers);
