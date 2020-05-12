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
import Grid from '@material-ui/core/Grid';

import Header from '../Header';
import Sidebar from '../Sidebar';
import Footer from '../Footer';

// OpenDrawer component

type OpenDrawerProps = {
  drawerClasses?: Object,
  ...React.ElementConfig<typeof Drawer>,
};

// eslint-disable-next-line react/prop-types
function OpenDrawer({ drawerClasses, ...props }: OpenDrawerProps) {
  return <Drawer variant="permanent" open classes={drawerClasses} {...props} />;
}

// main component

const styled = withStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  sidebar: {
    position: 'relative',
    height: '100vh',
  },
}));

type LayoutProps = {|
  children: React.Node,
  classes: Object,
  contentFill: boolean,
|};

function Layout({ children, classes, contentFill }: LayoutProps) {
  return (
    <Grid container direction="row" wrap="nowrap">
      <AppBar className={classes.appBar}>
        <Header />
      </AppBar>
      <Grid
        item
        component={OpenDrawer}
        drawerClasses={{ paper: classes.sidebar }}
      >
        <div className={classes.appBarSpacer} />
        <Divider />
        <div style={{ overflow: 'auto' }}>
          <Sidebar />
        </div>
      </Grid>
      <Grid
        item
        style={{
          flex: '1 auto',
          height: '100vh',
        }}
        container
        direction="column"
        wrap="nowrap"
      >
        <Grid item className={classes.appBarSpacer} />
        <Grid
          item
          style={{
            flex: '1 auto',
            // when not in contentFill mode, allow scrolling
            ...(contentFill ? {} : { overflow: 'auto' }),
          }}
          container
          direction="column"
          wrap="nowrap"
        >
          <Grid
            item
            component="main"
            style={{
              ...(contentFill
                ? {
                    // fix height to fill the container
                    flex: '1 0 0',
                    minHeight: 0,
                  }
                : {
                    // fill, but don't shrink to fit
                    // the parent scroll the main content together with the footer
                    flex: '1 auto',
                  }),
            }}
          >
            {children}
          </Grid>
          <Footer />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default styled(Layout);
