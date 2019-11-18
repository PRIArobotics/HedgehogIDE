// @flow

import * as React from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import type { RcTreeNodeEvent } from './RcTreeTypes';

export type FileAction = 'CREATE_FOLDER' | 'CREATE_FILE' | 'RENAME' | 'DELETE';

type PropTypes = {|
  onFileAction: (RcTreeNodeEvent, FileAction) => void | Promise<void>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    anchor: HTMLElement,
    node: RcTreeNodeEvent,
  |} | null,
|};

class FileMenu extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
  };

  show(anchor: HTMLElement, node: RcTreeNodeEvent) {
    this.setState({ visible: true, config: { anchor, node } });
  }

  hide() {
    this.setState({ visible: false });
  }

  action(action: FileAction) {
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'config is null';
    const { node } = this.state.config;

    this.hide();
    this.props.onFileAction(node, action);
  }

  render() {
    const [anchor, isRoot, isLeaf] =
      this.state.config === null
        ? [null, null, null]
        : [
            this.state.config.anchor,
            this.state.config.node.props.eventKey === '.',
            this.state.config.node.props.isLeaf,
          ];

    return (
      <Menu
        anchorEl={anchor}
        keepMounted
        open={this.state.visible}
        onClose={() => this.hide()}
      >
        <MenuItem
          onClick={() => this.action('CREATE_FOLDER')}
          disabled={isLeaf}
        >
          New Folder
        </MenuItem>
        <MenuItem onClick={() => this.action('CREATE_FILE')} disabled={isLeaf}>
          New File
        </MenuItem>
        <MenuItem onClick={() => this.action('RENAME')} disabled={isRoot}>
          Rename
        </MenuItem>
        <MenuItem onClick={() => this.action('DELETE')} disabled={isRoot}>
          Delete
        </MenuItem>
      </Menu>
    );
  }
}

export default FileMenu;
