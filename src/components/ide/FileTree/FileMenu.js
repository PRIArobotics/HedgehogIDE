// @flow

import * as React from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import type {
  FilerRecursiveStatInfo,
  FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';
import type { FileReference } from './FileTree';

export type FileAction = 'CREATE_FOLDER' | 'CREATE_FILE' | 'RENAME' | 'DELETE';

type PropTypes = {|
  onFileAction: (
    file: FileReference,
    action: FileAction,
  ) => void | Promise<void>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    anchor: HTMLElement,
    file: FileReference,
  |} | null,
|};

class FileMenu extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
  };

  show(anchor: HTMLElement, file: FileReference) {
    this.setState({ visible: true, config: { anchor, file } });
  }

  hide() {
    this.setState({ visible: false });
  }

  action(action: FileAction) {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'menu is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const { config: {file} } = this.state;

    this.hide();
    this.props.onFileAction(file, action);
  }

  render() {
    // this will only trigger before the first showing.
    // after that, the old config is still present and will ensure that
    // fade out animations won't glitch due to changing contents.
    if (this.state.config === null) return null;

    const {
      visible,
      config: { anchor, file },
    } = this.state;

    const isRoot = file.path === '.';
    const isLeaf = !file.file.isDirectory();

    return (
      <Menu
        anchorEl={anchor}
        keepMounted
        open={visible}
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
