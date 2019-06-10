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
import CodeIcon from '@material-ui/icons/Code';
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
  classes: object,
|};

class Sidebar extends React.Component<PropTypes> {
  render() {
    const { classes } = this.props;

    return (
      <List>
        <ListItem button component={Link} to="/ide">
          <ListItemIcon className={classes.listItemIcon}>
            <CodeIcon />
          </ListItemIcon>
        </ListItem>
        <ListItem button>
          <ListItemIcon className={classes.listItemIcon}>
            <TuneIcon />
          </ListItemIcon>
        </ListItem>
        <ListItem button component={Link} to="/simulator">
          <ListItemIcon className={classes.listItemIcon}>
            <NavigationIcon />
          </ListItemIcon>
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/apollo">
          <ListItemIcon className={classes.listItemIcon}>
            <CloudQueueIcon />
          </ListItemIcon>
        </ListItem>
      </List>
    );
  }
}

export default styled(Sidebar);
