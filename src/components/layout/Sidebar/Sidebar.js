// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

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
  // ControlsIcon,
  ApolloTestIcon,
  IndexDBTestIcon,
  WebRTCTestIcon,
} from '../../misc/palette';

import Link from '../../misc/Link';

const messages = defineMessages({
  ideTooltip: {
    id: 'app.sidebar.ide_tooltip',
    description: 'Tooltip for the IDE main page',
    defaultMessage: 'IDE',
  },
  helpTooltip: {
    id: 'app.sidebar.help_tooltip',
    description: 'Tooltip for the Help page',
    defaultMessage: 'Help',
  },
  contestTooltip: {
    id: 'app.sidebar.contest_tooltip',
    description: 'Tooltip for the Contest page',
    defaultMessage: 'Contest',
  },
});

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
    title?: string,
    titleMsg?: Object,
    target: string,
    icon: Class<React.Component<any>>,
  |};

  function NavItem({ title, titleMsg, target, icon: TheIcon }: NavItemProps) {
    return (
      <Tooltip
        title={titleMsg ? <FormattedMessage {...titleMsg} /> : title}
        placement="right"
      >
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
      <NavItem
        titleMsg={messages.ideTooltip}
        target="/projects"
        icon={IdeIcon}
      />
      <NavItem titleMsg={messages.helpTooltip} target="/help" icon={HelpIcon} />
      <NavItem
        titleMsg={messages.contestTooltip}
        target="/contest"
        icon={ContestIcon}
      />
      {/* <NavItem titleMsg={messages.controlsTooltip} target="/control" icon={ControlsIcon} /> */}
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
