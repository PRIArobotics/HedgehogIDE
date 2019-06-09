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

import { withStyles } from '@material-ui/styles';

import Header from '../Header';
import Sidebar from '../Sidebar';
import Footer from '../Footer';

const styled = withStyles(theme => ({
  root: {
    height: '100vh',
    display: 'flex',
  },
  main: {
    flex: '1 auto',
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flex: '1 auto',
  },
  footer: {
    flex: '0 auto',
  },
}));

type PropTypes = {|
  children: Node,
  classes: object,
|};

class Layout extends React.Component<PropTypes> {
  render() {
    const { children, classes } = this.props;

    return (
      <div className={classes.root}>
        <Header />
        <Sidebar />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <div className={classes.content}>{children}</div>
          <div className={classes.footer}>
            <Footer />
          </div>
        </main>
      </div>
    );
  }
}

export default styled(Layout);
