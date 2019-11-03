// @flow

import { type GraphqlDef } from '../graphqlDef';

const def: GraphqlDef = {
  schema: [
    `
    type NetworkStatus {
      isConnected: Boolean!
    }
    `,
  ],
  queries: [
    `
    networkStatus: NetworkStatus!
    `,
  ],
  mutations: [
    `
    updateNetworkStatus(isConnected: Boolean): NetworkStatus!
    `,
  ],
  resolvers: () => ({
    Mutation: {
      updateNetworkStatus: (_, { isConnected }, { cache }) => {
        const data = {
          networkStatus: {
            __typename: 'NetworkStatus',
            isConnected,
          },
        };
        cache.writeData({ data });
        return null;
      },
    },
  }),
  defaults: {
    networkStatus: {
      __typename: 'NetworkStatus',
      isConnected: true,
    },
  },
};

export default def;
