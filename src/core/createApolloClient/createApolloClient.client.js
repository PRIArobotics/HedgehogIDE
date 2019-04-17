import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { from, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import apolloLogger from 'apollo-link-logger';
import { withClientState } from 'apollo-link-state';
import createCache from './createCache';
import { resolvers as clientSideResolvers } from '../../data/graphql/OnMemoryState/schema';

export default function createApolloClient() {
  const cache = createCache();

  const stateLink = withClientState({
    cache,
    defaults: window.App.initialState,
    resolvers: clientSideResolvers,
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

  const httpLink = new HttpLink({
    uri: '/graphql',
    credentials: 'include',
  });

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsLink = new WebSocketLink({
    uri: `${wsProtocol}//${window.location.host}/subscriptions`,
    options: {
      reconnect: true,
      // connectionParams: {
      //   authToken: localStorage.getItem(AUTH_TOKEN),
      // },
    },
  });

  const link = from([
    stateLink,
    errorLink,
    ...(__DEV__ ? [apolloLogger] : []),
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
    cache: cache.restore(window.App.cache),
    queryDeduplication: true,
    connectToDevTools: true,
  });
}
