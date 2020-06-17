import { ApolloClient } from 'apollo-client';
import { from } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { SchemaLink } from 'apollo-link-schema';
import createCache from './createCache';
import clientSchema from '../graphql/schema';

export default function createApolloClient(schema, initialState) {
  const cache = createCache();
  cache.writeData({ data: initialState });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      );
    if (networkError) console.warn(`[Network error]: ${networkError}`);
  });

  const schemaLink = new SchemaLink({ ...schema });

  const link = from([errorLink, schemaLink]);

  return new ApolloClient({
    link,
    cache,
    resolvers: clientSchema.resolvers,
    queryDeduplication: true,
    ssrMode: true,
  });
}
