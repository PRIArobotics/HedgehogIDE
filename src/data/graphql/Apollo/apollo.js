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

export const resolvers = {
  RootQuery: {
    apolloQuery() {
      return { data: 'Hello World' };
    },
  },
};
