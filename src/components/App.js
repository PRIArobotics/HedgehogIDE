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
import { ApolloProvider } from '@apollo/react-hooks';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import StyleContext from 'isomorphic-style-loader/StyleContext';

import theme from './theme';

import { LocaleProvider } from './locale';
import { AuthProvider } from './users/AuthProvider';

// Since the current React Starter Kit uses older React Context API that cannot be typed,
// here we declare duplicate type information.

type ContextType = {|
  pathname: string,
  query: Object,
  client: Object,
  locales: string[],
|};

type Props = {|
  context: ContextType,
  insertCss: Function,
  children: React.Node,
|};

const ContextRuntimeType = {
  // Universal HTTP client
  pathname: PropTypes.string.isRequired,
  query: PropTypes.object,
  // Apollo Client
  client: PropTypes.object.isRequired,
  // Locale
  locales: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const PropTypesRuntimeType = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: PropTypes.func.isRequired,
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

  render() {
    const {
      context: { client, locales },
      insertCss,
      children,
    } = this.props;

    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    return (
      <StyleContext.Provider value={{ insertCss }}>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <LocaleProvider userAgentLocales={locales}>
              <AuthProvider>
                <CssBaseline />
                {children}
              </AuthProvider>
            </LocaleProvider>
          </ThemeProvider>
        </ApolloProvider>
      </StyleContext.Provider>
    );
  }
}

export default App;
