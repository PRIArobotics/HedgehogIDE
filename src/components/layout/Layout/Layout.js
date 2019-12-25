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

type PropTypes = {|
  children: React.Node,
  classes: Object,
  contentFill: boolean,
|};

class Layout extends React.Component<PropTypes> {
  render() {
    const { children, classes, contentFill } = this.props;

    return (
      <Grid container direction="row" wrap="nowrap">
        <AppBar className={classes.appBar}>
          <Header />
        </AppBar>
        <Grid
          item
          component={props => (
            <Drawer
              classes={{ paper: classes.sidebar }}
              variant="permanent"
              open
              {...props}
            />
          )}
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
}

export default styled(Layout);
