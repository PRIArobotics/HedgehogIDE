/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import * as React from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';
import { ThemeProvider } from '@material-ui/styles';
import { IntlProvider } from 'react-intl';
import CssBaseline from '@material-ui/core/CssBaseline';

import theme from './theme';

// Since the current React Starter Kit uses older React Context API that cannot be typed,
// here we declare duplicate type information.

type ContextType = {|
  insertCss: Function,
  pathname: string,
  query: Object,
  client: Object,
  locale: string,
|};

type Props = {|
  context: ContextType,
  children: React.Node,
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
  // Locale
  locale: PropTypes.string.isRequired,
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
    const { client, locale } = this.props.context;
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    return (
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <IntlProvider locale={locale}>
            <CssBaseline />
            {this.props.children}
          </IntlProvider>,
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default App;
