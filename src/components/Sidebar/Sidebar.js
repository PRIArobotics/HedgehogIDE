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

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import EditIcon from '@material-ui/icons/Edit';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import NavigationIcon from '@material-ui/icons/Navigation';
import TuneIcon from '@material-ui/icons/Tune';
import { withStyles } from '@material-ui/styles';

import Link from '../misc/Link';

const styled = withStyles(theme => ({
  listItemIcon: {
    minWidth: 'auto',
  },
  toolbar: theme.mixins.toolbar,
}));

type PropTypes = {|
  classes: Object,
|};

class Sidebar extends React.Component<PropTypes> {
  render() {
    const { classes } = this.props;

    return (
      <List>
        <Tooltip title="IDE" placement="right">
          <ListItem button component={Link} to="/ide">
            <ListItemIcon className={classes.listItemIcon}>
              <EditIcon />
            </ListItemIcon>
          </ListItem>
        </Tooltip>
        <Tooltip title="Robot Controls" placement="right">
          <ListItem button>
            <ListItemIcon className={classes.listItemIcon}>
              <TuneIcon />
            </ListItemIcon>
          </ListItem>
        </Tooltip>
        <Divider />
        <Tooltip title="Apollo Feature Test" placement="right">
          <ListItem button component={Link} to="/apollo">
            <ListItemIcon className={classes.listItemIcon}>
              <CloudQueueIcon />
            </ListItemIcon>
          </ListItem>
        </Tooltip>
        <Tooltip title="IndexedDB Feature Test" placement="right">
          <ListItem button component={Link} to="/indexedDB">
            <ListItemIcon className={classes.listItemIcon}>
              <NavigationIcon />
            </ListItemIcon>
          </ListItem>
        </Tooltip>
      </List>
    );
  }
}

export default styled(Sidebar);
