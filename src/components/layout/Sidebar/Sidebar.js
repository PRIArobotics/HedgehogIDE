// @flow

import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/styles';

import {
  IdeIcon,
  HelpIcon,
  ContestIcon,
  ControlsIcon,
  ApolloTestIcon,
  IndexDBTestIcon,
  WebRTCTestIcon,
} from '../../misc/palette';

import Link from '../../misc/Link';

const styled = withStyles(theme => ({
  listItemIcon: {
    minWidth: 'auto',
  },
  toolbar: theme.mixins.toolbar,
}));

type SidebarProps = {|
  classes: Object,
|};

function Sidebar({ classes }: SidebarProps) {
  type NavItemProps = {|
    title: string,
    target: string,
    icon: Class<React.Component<any>>,
  |};

  function NavItem({ title, target, icon }: NavItemProps) {
    const TheIcon = icon;

    return (
      <Tooltip title={title} placement="right">
        <ListItem button component={Link} to={target}>
          <ListItemIcon className={classes.listItemIcon}>
            <TheIcon />
          </ListItemIcon>
        </ListItem>
      </Tooltip>
    );
  }

  return (
    <List>
      <NavItem title="IDE" target="/projects" icon={IdeIcon} />
      <NavItem title="Help" target="/help" icon={HelpIcon} />
      <NavItem title="Contest" target="/contest" icon={ContestIcon} />
      {/* <NavItem title="Robot Controls" target="/control" icon={ControlsIcon} /> */}
      {__DEV__ ? (
        <>
          <Divider />
          <NavItem title="Apollo Test" target="/apollo" icon={ApolloTestIcon} />
          <NavItem
            title="IndexedDB Test"
            target="/indexedDB"
            icon={IndexDBTestIcon}
          />
          <NavItem title="WebRTC Test" target="/webrtc" icon={WebRTCTestIcon} />
        </>
      ) : null}
    </List>
  );
}

export default styled(Sidebar);
