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

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/styles';

import Header from '../Header';
import Sidebar from '../Sidebar';
import Footer from '../Footer';

const styled = withStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  sidebar: {
    position: 'relative',
  },
  main: {
    flex: '1 auto',

    height: '100vh',
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  contentPane: {
    flex: '1 auto',
    overflow: 'auto',

    display: 'flex',
    flexFlow: 'column nowrap',
  },
  content: {
    flex: '1 auto',
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
        <AppBar className={classes.appBar}>
          <Header />
        </AppBar>
        <Drawer classes={{ paper: classes.sidebar }} variant="permanent" open>
          <div className={classes.appBarSpacer} />
          <Divider />
          <Sidebar />
        </Drawer>
        <div className={classes.main}>
          <div className={classes.appBarSpacer} />
          <div className={classes.contentPane}>
            <main className={classes.content}>{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }
}

export default styled(Layout);
