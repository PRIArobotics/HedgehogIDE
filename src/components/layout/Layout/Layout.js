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
import { withStyles } from '@material-ui/styles';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';

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
    height: '100vh',
  },
  sidebarContent: {
    overflow: 'auto',
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
  contentPaneFill: {
    flex: '1 auto',

    display: 'flex',
    flexFlow: 'column nowrap',
  },
  contentFill: {
    flex: '1 0 0',
    minHeight: 0,
  },
}));

type PropTypes = {|
  children: React.Node,
  classes: Object,
  contentFill: boolean,
|};

class Layout extends React.Component<PropTypes> {
  render() {
    const { children, classes, contentFill } = this.props;

    const contentPaneClass = contentFill
      ? classes.contentPaneFill
      : classes.contentPane;
    const contentClass = contentFill ? classes.contentFill : classes.content;

    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar}>
          <Header />
        </AppBar>
        <Drawer classes={{ paper: classes.sidebar }} variant="permanent" open>
          <div className={classes.appBarSpacer} />
          <Divider />
          <div className={classes.sidebarContent}>
            <Sidebar />
          </div>
        </Drawer>
        <div className={classes.main}>
          <div className={classes.appBarSpacer} />
          <div className={contentPaneClass}>
            <main className={contentClass}>{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }
}

export default styled(Layout);
