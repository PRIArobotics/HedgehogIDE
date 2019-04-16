import { ApolloClient } from 'apollo-client';
import { from } from 'apollo-link';
import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { SchemaLink } from 'apollo-link-schema';
import createCache from './createCache';

export default function createApolloClient(schema, initialState) {
  const cache = createCache();

  const stateLink = withClientState({
    cache,
    defaults: initialState,
    resolvers: {},
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.warn(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    if (networkError) console.warn(`[Network error]: ${networkError}`);
  });

  const schemaLink = new SchemaLink({ ...schema });

  const link = from([stateLink, errorLink, schemaLink]);

  return new ApolloClient({
    link,
    cache,
    ssrMode: true,
    queryDeduplication: true,
  });
}
