/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import React from 'react';
import type { Node } from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';

// Since the current React Starter Kit uses older React Context API that cannot be typed,
// here we declare duplicate type information.

type ContextType = {|
  insertCss: Function,
  pathname: string,
  query: Object,
  client: Object,
|};

type Props = {|
  context: ContextType,
  children: Node,
|};

const ContextRuntimeType = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: PropTypes.func.isRequired,
  // Universal HTTP client
  pathname: PropTypes.string.isRequired,
  query: PropTypes.object,
  // Apollo Client
  client: PropTypes.object.isRequired,
};

const PropTypesRuntimeType = {
  context: PropTypes.shape(ContextRuntimeType).isRequired,
  children: PropTypes.element.isRequired,
};

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   };
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   );
 */
class App extends React.PureComponent<Props> {
  static propTypes = PropTypesRuntimeType;

  static childContextTypes = ContextRuntimeType;

  getChildContext() {
    return this.props.context;
  }

  render() {
    // Here, we are at universe level, sure? ;-)
    const { client } = this.props.context;
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    return (
      <ApolloProvider client={client}>{this.props.children}</ApolloProvider>
    );
  }
}

export default App;
