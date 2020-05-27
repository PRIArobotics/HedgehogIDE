import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { from, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
// import apolloLogger from 'apollo-link-logger';
import { setContext } from 'apollo-link-context';
import createCache from './createCache';
import clientSchema from '../graphql/schema';

export default function createApolloClient() {
  const cache = createCache();
  if (window.App) cache.restore(window.App.cache);

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

  const wsLink = new WebSocketLink({
    uri: `${__DEV__ ? 'ws' : 'wss'}://${window.location.host}/subscriptions`,
    options: {
      reconnect: true,
    },
  });

  const authLink = setContext((_, { headers }) => {
    const authData = JSON.parse(localStorage.getItem('auth') || null);
    return {
      headers: {
        ...headers,
        authorization: authData && authData.token ? `${authData.token}` : '',
      },
    };
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
      authLink.concat(httpLink),
    ),
  ]);

  return new ApolloClient({
    link,
    cache,
    resolvers: clientSchema.resolvers,
    queryDeduplication: true,
    connectToDevTools: true,
  });
}
