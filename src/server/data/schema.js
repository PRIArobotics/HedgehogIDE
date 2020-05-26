// @flow

import { PubSub } from 'graphql-subscriptions';

import { type GraphqlDef, merge } from '../../core/graphql/graphqlDef';

import Server from './graphql/schema';
import Core from '../../core/graphql/schema';
import AuthDirective from './AuthDirective';

const def: GraphqlDef = merge(Server, Core);

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
    ${def.queries.toString()}
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
    ${def.mutations.toString()}
  }
  `,
];

// This adds a dummy subscription in case no subscription is defined.
// As the server cannot start without the Subscription type defined and
// empty types are apparently not allowed (see https://github.com/graphql/graphql-js/issues/937).
const Subscription = def.subscriptions.length > 0 ? [
  `
  type Subscription {
    ${def.subscriptions.toString()}
  }
  `,
] : [
  `
  type Subscription {
    _ : Boolean
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
  `
  directive @auth on OBJECT | FIELD_DEFINITION
  `,
  ...SchemaDefinition,
  ...RootQuery,
  ...Mutation,
  ...Subscription,

  ...def.schema,
];

export default {
  typeDefs: schema,
  resolvers: def.resolvers(new PubSub()),
  schemaDirectives: {
    auth: AuthDirective,
  },
  ...(__DEV__ ? { log: (e: Error) => console.error(e.stack) } : {}),
};
