// @flow

import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver, GraphQLField } from 'graphql';
import { AuthenticationError } from 'apollo-server';

// From: https://github.com/jwhenshaw/graphql-directives-auth/blob/master/FieldAuthDirective.js
export default class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField, _details: any) {
    this.ensureFieldWrapped(field);
  }

  ensureFieldWrapped(field: GraphQLField) {
    const { resolve: originalResolve = defaultFieldResolver } = field;

    async function resolve(...args) {
      const context = args[2];
      if (!context.user?.userId) {
        throw new AuthenticationError('not authorized');
      }

      return originalResolve.apply(this, args);
    }

    // eslint-disable-next-line no-param-reassign
    field.resolve = resolve.bind(this);
  }
}
