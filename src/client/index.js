/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'webrtc-adapter';
import 'whatwg-fetch';
import * as React from 'react';
import ReactDOM from 'react-dom';
import deepForceUpdate from 'react-deep-force-update';
import queryString from 'query-string';
import { createPath } from 'history/PathUtils';

import App from '../components/App';
import setupHistory from './history';
import { updateMeta } from './DOMUtils';
import createApolloClient from '../core/createApolloClient';
import router from '../core/router';
import setupNetworkStatus from './networkStatus';
import setupServiceWorker from './serviceWorker';

if ('serviceWorker' in navigator)
  window.addEventListener('load', setupServiceWorker);

const apolloClient = createApolloClient();

// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const context = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: (...styles) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map(x => x._insertCss());
    return () => {
      removeCss.forEach(f => f());
    };
  },
  // For react-apollo
  client: apolloClient,
};

const container = document.getElementById('app');
let appInstance;

// Re-render the app when window.location changes
// eslint-disable-next-line no-shadow
const history = setupHistory(async (history, location, isInitialRender) => {
  try {
    context.pathname = location.pathname;
    context.query = queryString.parse(location.search);

    // Traverses the list of routes in the order they are defined until
    // it finds the first route that matches provided URL path string
    // and whose action method returns anything other than `undefined`.
    const route = await router.resolve(context);

    // Prevent multiple page renders during the routing process
    if (history.currentLocation.key !== location.key) {
      return;
    }

    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }

    const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
    appInstance = renderReactApp(
      <App context={context}>{route.component}</App>,
      container,
      () => {
        if (isInitialRender) {
          // Switch off the native scroll restoration behavior and handle it manually
          // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
          if (window.history && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
          }

          {
            const elem = document.getElementById('css');
            if (elem) elem.parentNode.removeChild(elem);
          }
          {
            const elem = document.getElementById('material-css');
            if (elem) elem.parentNode.removeChild(elem);
          }
          return;
        }

        document.title = route.title;

        updateMeta('description', route.description);
        // Update necessary tags in <head> at runtime here, ie:
        // updateMeta('keywords', route.keywords);
        // updateCustomMeta('og:url', route.canonicalUrl);
        // updateCustomMeta('og:image', route.imageUrl);
        // updateLink('canonical', route.canonicalUrl);
        // etc.

        history.restoreScrolling(location);

        // Google Analytics tracking. Don't send 'pageview' event after
        // the initial rendering, as it was already sent
        if (window.ga) {
          window.ga('send', 'pageview', createPath(location));
        }
      },
    );
  } catch (error) {
    if (__DEV__) {
      throw error;
    }

    console.error(error);

    // Do a full page reload if error occurs during client-side navigation
    if (!isInitialRender && history.currentLocation.key === location.key) {
      console.error('RSK will reload your page after error');
      window.location.reload();
    }
  }
});

// Enable Hot Module Replacement (HMR)
if (module.hot) {
  module.hot.accept('../core/router', () => {
    if (appInstance && appInstance.updater.isMounted(appInstance)) {
      // Force-update the whole tree, including components that refuse to update
      deepForceUpdate(appInstance);
    }

    history.initialRender();
  });
}

// This is a demonstration of how to mutate the client state of apollo-link-state.
// If you don't need the networkStatus, please erase below lines.
setupNetworkStatus(apolloClient);
