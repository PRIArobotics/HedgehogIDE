/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
import jwt from 'jsonwebtoken';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import { getDataFromTree } from 'react-apollo';
import http from 'http';
import https from 'https';
import createApolloClient from '../core/createApolloClient';
import App from '../components/App';
import Html from './Html';
import { ErrorPageWithoutStyle } from '../routes/error/ErrorPage';
import errorPageStyle from '../routes/error/ErrorPage.css';
import passport from './passport';
import router from '../core/router';
import models from './data/models';
import schema from './data/schema';
// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import config from './config';
import createInitialState from '../core/createInitialState';

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

const app = express();

//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.set('trust proxy', config.trustProxy);

// keep a list of auth-relevant middlewares to decode cookies in the WS handler
const authMiddlewares = [];

function useAuth(mw) {
  authMiddlewares.push(mw);
  app.use(mw);
}

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
useAuth(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
useAuth(
  expressJwt({
    secret: config.auth.jwt.secret,
    credentialsRequired: false,
    getToken: req => req.cookies.id_token,
  }),
);
// Error handler for express-jwt
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err instanceof Jwt401Error) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    res.clearCookie('id_token');
  }
  next(err);
});

app.use(passport.initialize());

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect('/');
  },
);

app.get(
  '/login/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'user_location'],
    session: false,
  }),
);
app.get(
  '/login/facebook/return',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect('/');
  },
);

//
// Register API middleware
// -----------------------------------------------------------------------------
// https://github.com/graphql/express-graphql#options

const server = new ApolloServer({
  ...schema,
  subscriptions: {
    path: '/subscriptions',
    onConnect: async (connectionParams, webSocket) => {
      const applyMiddleware = (middleware, req) =>
        new Promise(resolve => middleware(req, null, resolve));

      // eslint-disable-next-line no-restricted-syntax
      for (const middleware of authMiddlewares) {
        // eslint-disable-next-line no-await-in-loop
        await applyMiddleware(middleware, webSocket.upgradeReq);
      }

      return {
        user: webSocket.upgradeReq.user,
        ...connectionParams,
      };
    },
  },
  uploads: false,
  introspection: __DEV__,
  playground: __DEV__ && {
    subscriptionEndpoint: '/subscriptions',
  },
  debug: __DEV__,
  context: ({ req, connection }) => {
    if (req !== undefined) {
      return { req };
    }
    if (connection !== undefined) {
      return { connection };
    }
    return {};
  },
});
server.applyMiddleware({ app });

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    };

    const initialState = createInitialState({
      user: req.user || null,
    });

    const apolloClient = createApolloClient(
      {
        schema: makeExecutableSchema(schema),
        // This is a context consumed in GraphQL Resolvers
        context: { req },
      },
      initialState,
    );

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      insertCss,
      // The twins below are wild, be careful!
      pathname: req.path,
      query: req.query,
      // Apollo Client for use with react-apollo
      client: apolloClient,
    };

    const route = await router.resolve(context);

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const rootComponent = <App context={context}>{route.component}</App>;
    await getDataFromTree(rootComponent);
    const children = ReactDOM.renderToString(rootComponent);

    const styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set();
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk('client');
    if (route.chunk) addChunk(route.chunk);
    if (route.chunks) route.chunks.forEach(addChunk);

    const data = {
      ...route,
      children,
      styles,
      scripts: Array.from(scripts),
      app: {
        apiUrl: config.api.clientUrl,
        // Cache for client-side apolloClient
        cache: context.client.extract(),
        // Initial state for client-side stateLink
        initialState,
      },
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(pe.render(err));

  const rootComponent = <ErrorPageWithoutStyle error={err} />;
  const children = ReactDOM.renderToString(rootComponent);

  const styles = [
    { id: 'css', cssText: errorPageStyle._getCss() }, // eslint-disable-line no-underscore-dangle
  ];

  const data = {
    title: 'Internal Server Error',
    description: err.message,
    styles,
    children,
  };

  const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
const promise = models.sync().catch(err => console.error(err.stack));
if (!module.hot) {
  promise.then(() => {
    // TODO no subscriptions when using `yarn start`
    if (__DEV__) {
      // set up the regular server
      const ws = http.createServer(app);
      server.installSubscriptionHandlers(ws);
      ws.listen(config.port, () => {
        console.info(
          `The server is running at http://localhost:${config.port}/`,
        );
      });
    } else {
      // set up the regular server without websocket support
      const ws = http.createServer(app);
      ws.listen(config.port, () => {
        console.info(
          `The server is running at http://localhost:${config.port}/`,
        );
      });

      // set up the https server with websocket support
      const wss = https.createServer(
        {
          key: fs.readFileSync(config.keyFile),
          cert: fs.readFileSync(config.certFile),
        },
        app,
      );
      server.installSubscriptionHandlers(wss);
      wss.listen(config.securePort, () => {
        console.info(
          `The server is running at https://localhost:${config.securePort}/`,
        );
      });
    }
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('../core/router');
}

export default app;
