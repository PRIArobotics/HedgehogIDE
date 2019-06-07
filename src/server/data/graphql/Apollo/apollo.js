export const schema = [
  `
  type Value {
    data: String!
  }
`,
];

export const queries = [
  `
  apolloQuery: Value!
`,
];

export const mutations = [
  `
  apolloMutation: Value!
`,
];

export const subscriptions = [
  `
  apolloSubscription: Value!
`,
];

export const resolvers = pubsub => ({
  RootQuery: {
    async apolloQuery() {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      await sleep(500);
      return { data: `Hello ${new Date()}` };
    },
  },
  Mutation: {
    async apolloMutation() {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      await sleep(500);
      const msg = { data: `Hello ${new Date()}` };
      pubsub.publish('apolloChannel', { apolloSubscription: msg });
      return msg;
    },
  },
  Subscription: {
    apolloSubscription: {
      subscribe: () => pubsub.asyncIterator('apolloChannel'),
    },
  },
});
