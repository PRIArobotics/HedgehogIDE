// @flow

import * as React from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

type PropTypes = {|
|};
type StateTypes = {|
  visible: boolean,
  anchor: HTMLElement | null,
|};

class FileMenu extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    anchor: null,
  };

  show(anchor: HTMLElement) {
    this.setState({ visible: true, anchor });
  }

  hide() {
    this.setState({ visible: false });
  }

  render() {
    return (
      <Menu
        anchorEl={this.state.anchor}
        keepMounted
        open={this.state.visible}
        onClose={() => this.hide()}
      >
        <MenuItem onClick={() => this.hide()}>New Folder</MenuItem>
        <MenuItem onClick={() => this.hide()}>New File</MenuItem>
        <MenuItem onClick={() => this.hide()}>Rename</MenuItem>
        <MenuItem onClick={() => this.hide()}>Delete</MenuItem>
      </Menu>
);
  }
}

export default FileMenu;
