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

export const resolvers = {
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
      return { data: `Hello ${new Date()}` };
    },
  },
};
