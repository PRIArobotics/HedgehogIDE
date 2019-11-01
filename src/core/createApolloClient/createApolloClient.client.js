import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { from, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
// import apolloLogger from 'apollo-link-logger';
import createCache from './createCache';
import { resolvers as clientSideResolvers } from '../graphql/OnMemoryState/schema';

export default function createApolloClient() {
  const cache = createCache().restore(window.App.cache);

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.warn(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    if (networkError) console.warn(`[Network error]: ${networkError}`);
  });

  const httpLink = new HttpLink({
    uri: '/graphql',
    credentials: 'include',
  });

  // TODO hardcoded Uberspace port
  const wsLink = new WebSocketLink({
    uri: __DEV__
      ? `ws://${window.location.host}/subscriptions`
      : `wss://${window.location.hostname}:63171/subscriptions`,
    options: {
      reconnect: true,
    },
  });

  const link = from([
    errorLink,
    // ...(__DEV__ ? [apolloLogger] : []),
    split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink,
    ),
  ]);

  return new ApolloClient({
    link,
    cache,
    resolvers: clientSideResolvers,
    queryDeduplication: true,
    connectToDevTools: true,
  });
}
