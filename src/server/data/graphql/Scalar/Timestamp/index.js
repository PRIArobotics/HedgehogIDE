// @flow

import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import { type GraphqlDefShape } from '../../../../../core/graphql/graphqlDef';

const def: GraphqlDefShape = {
  schema: [
    `
    # GraphQL cannot handle long - normal timestamp will go failed.
    # In that case, use Timestamp.
    scalar Timestamp
    `,
  ],
  resolvers: () => ({
    Timestamp: new GraphQLScalarType({
      name: 'Timestamp',
      description: 'Timestamp custom scalar type',
      parseValue(value) {
        return value;
      },
      serialize(value) {
        return value;
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
          return ast.value;
        }
        return null;
      },
    }),
  }),
};

export default def;
