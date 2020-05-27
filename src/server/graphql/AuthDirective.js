// @flow
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver } from 'graphql';
import { AuthenticationError } from 'apollo-server';

// From: https://github.com/jwhenshaw/graphql-directives-auth/blob/master/FieldAuthDirective.js
export default class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    this.ensureFieldWrapped(field);
  }

  ensureFieldWrapped(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const context = args[2];
      if (!context.user || !context.user.userId) {
        throw new AuthenticationError('not authorized');
      }

      return resolve.apply(this, args);
    }.bind(this);
  }
}
