// @flow

import { PubSub } from 'graphql-subscriptions';

import { type GraphqlDefShape } from '../../../../core/graphql/graphqlDef';

const def: GraphqlDefShape = {
  schema: [
    `
    type Value {
      data: String!
    }
    `,
  ],
  queries: [
    `
    apolloQuery: Value!
    `,
  ],
  mutations: [
    `
    apolloMutation: Value!
    `,
  ],
  subscriptions: [
    `
    apolloSubscription: Value!
    `,
  ],
  resolvers: (pubsub: PubSub) => ({
    RootQuery: {
      async apolloQuery() {
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        await sleep(500);
        return { data: `Hello ${new Date().toString()}` };
      },
    },
    Mutation: {
      async apolloMutation() {
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        await sleep(500);
        const msg = { data: `Hello ${new Date().toString()}` };
        pubsub.publish('apolloChannel', { apolloSubscription: msg });
        return msg;
      },
    },
    Subscription: {
      apolloSubscription: {
        subscribe: () => pubsub.asyncIterator('apolloChannel'),
      },
    },
  }),
};

export default def;
