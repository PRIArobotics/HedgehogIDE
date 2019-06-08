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

import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { withStyles } from '@material-ui/styles';

const styled = withStyles(theme => ({
  drawerPaper: {
    // TODO this width is manually adjusted to center the icons
    width: '58px',
    overflowX: 'hidden',
  },
  toolbar: theme.mixins.toolbar,
}));

type PropTypes = {|
  classes: object,
|};

class Sidebar extends React.Component<PropTypes> {
  render() {
    const { classes } = this.props;

    return (
      <Drawer classes={{ paper: classes.drawerPaper }} variant="permanent" open>
        <div className={classes.toolbar} />
        <List>
          <ListItem button>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
          </ListItem>
        </List>
      </Drawer>
    );
  }
}

export default styled(Sidebar);
