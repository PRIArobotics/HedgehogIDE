// @flow

import { PubSub } from 'graphql-subscriptions';

import { type GraphqlDef, merge } from '../../core/graphql/graphqlDef';

import Apollo from './graphql/Apollo/schema';
import News from './graphql/News/schema';
import Database from './graphql/Database/schema';
import Scalar from './graphql/Scalar/Timestamp';
import OnMemoryState from '../../core/graphql/OnMemoryState/schema';

const def: GraphqlDef = merge(Apollo, News, Database, Scalar, OnMemoryState);

const RootQuery = [
  `
  # # React-Starter-Kit Querying API
  # ### This GraphQL schema was built with [Apollo GraphQL-Tools](https://github.com/apollographql/graphql-tools)
  # _Build, mock, and stitch a GraphQL schema using the schema language_
  #
  # **[Schema Language Cheet Sheet](https://raw.githubusercontent.com/sogko/graphql-shorthand-notation-cheat-sheet/master/graphql-shorthand-notation-cheat-sheet.png)**
  #
  # 1. Use the GraphQL schema language to [generate a schema](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) with full support for resolvers, interfaces, unions, and custom scalars. The schema produced is completely compatible with [GraphQL.js](https://github.com/graphql/graphql-js).
  # 2. [Mock your GraphQL API](https://www.apollographql.com/docs/graphql-tools/mocking.html) with fine-grained per-type mocking
  # 3. Automatically [stitch multiple schemas together](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) into one larger API
  type RootQuery {
    ${def.queries}
  }
  `,
];

const Mutation = [
  `
  # # React-Starter-Kit Mutating API
  # ### This GraphQL schema was built with [Apollo GraphQL-Tools](https://github.com/apollographql/graphql-tools)
  # _Build, mock, and stitch a GraphQL schema using the schema language_
  #
  # **[Schema Language Cheet Sheet](https://raw.githubusercontent.com/sogko/graphql-shorthand-notation-cheat-sheet/master/graphql-shorthand-notation-cheat-sheet.png)**
  #
  # 1. Use the GraphQL schema language to [generate a schema](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) with full support for resolvers, interfaces, unions, and custom scalars. The schema produced is completely compatible with [GraphQL.js](https://github.com/graphql/graphql-js).
  # 2. [Mock your GraphQL API](https://www.apollographql.com/docs/graphql-tools/mocking.html) with fine-grained per-type mocking
  # 3. Automatically [stitch multiple schemas together](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) into one larger API
  type Mutation {
    ${def.mutations}
  }
  `,
];

const Subscription = [
  `
  type Subscription {
    ${def.subscriptions}
  }
  `,
];

const SchemaDefinition = [
  `
  schema {
    query: RootQuery
    mutation: Mutation
    subscription: Subscription
  }
  `,
];

const schema = [
  ...SchemaDefinition,
  ...RootQuery,
  ...Mutation,
  ...Subscription,

  ...def.schema,
];

export default {
  typeDefs: schema,
  resolvers: def.resolvers(new PubSub()),
  ...(__DEV__ ? { log: (e: Error) => console.error(e.stack) } : {}),
};
