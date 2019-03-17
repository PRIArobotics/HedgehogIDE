import merge from 'lodash.merge';

/** * Queries ** */
import {
  schema as ApolloSchema,
  queries as ApolloQueries,
  resolvers as ApolloResolvers,
} from './apollo';

export const schema = [...ApolloSchema];

export const queries = [...ApolloQueries];

export const resolvers = merge(ApolloResolvers);
