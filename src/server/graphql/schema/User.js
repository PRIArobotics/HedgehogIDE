// @flow
import { ApolloError, AuthenticationError } from 'apollo-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import type { GraphqlDefShape } from '../../../core/graphql/graphqlDef';

import { User } from '../../mongodb';
import config from '../../config';

const def: GraphqlDefShape = {
  schema: [
    `
    type UserLogin {
      id: ID!
      username: String!
      token: String!
    }

    type User {
      id: ID!
      username: String!
    }
    `,
  ],
  queries: [
    `
    user: User! @auth
    `,
  ],
  mutations: [
    `
    login(username: String!, password: String!): UserLogin!
    `,
  ],
  resolvers: () => ({
    RootQuery: {
      async user(_, _args, context) {
        let user;
        try {
          user = await User.findById(context.user.userId);
        } catch (e) {
          console.error(e);
          throw new ApolloError('Failed to fetch user.');
        }

        return {
          id: user.id,
          username: user.username,
        };
      },
    },
    Mutation: {
      async login(_, { username, password }, _context) {
        let user;
        try {
          user = await User.findOne({ username });
        } catch (e) {
          console.error(e);
          throw new ApolloError('Failed to process login.');
        }
        if (!user) {
          throw new AuthenticationError('Invalid login credentials.');
        }

        const passwordMatch = await new Promise((res, rej) => {
          bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
              rej(err);
            } else {
              res(match);
            }
          });
        });
        if (passwordMatch) {
          const token = jwt.sign({ userId: user.id }, config.auth.jwt.secret, {
            expiresIn: config.auth.tokenExpiresIn,
          });

          // TODO: add expiry date
          return {
            id: user.id,
            username,
            token,
          };
        }
        throw new AuthenticationError('Invalid login credentials.');
      },
    },
  }),
};

export default def;
