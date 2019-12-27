// @flow

import * as React from 'react';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {
  FolderIcon,
  LanguageBlocklyIcon,
  LanguageJavascriptIcon,
  RenameIcon,
  DeleteIcon,
} from '../../misc/palette';

import type { FileAction, FileReference } from '.';

type Position = {|
  left: number,
  top: number,
|};

type PropTypes = {|
  onFileAction: (
    file: FileReference,
    action: FileAction,
  ) => void | Promise<void>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    anchorPosition: Position,
    file: FileReference,
  |} | null,
|};

class FileMenu extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
  };

  show(anchorPosition: Position, file: FileReference) {
    this.setState({ visible: true, config: { anchorPosition, file } });
  }

  hide() {
    this.setState({ visible: false });
  }

  action(action: FileAction) {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'menu is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { file },
    } = this.state;

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
      config: { anchorPosition, file },
    } = this.state;

    const isRoot = file.path === '.';
    const isLeaf = !file.file.isDirectory();

    return (
      <Menu
        keepMounted
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        open={visible}
        onClose={() => this.hide()}
      >
        <MenuItem
          onClick={() =>
            this.action({ action: 'CREATE', desc: { type: 'DIRECTORY' } })
          }
          disabled={isLeaf}
        >
          <ListItemIcon>
            <FolderIcon fontSize="small" />
          </ListItemIcon>
          New Folder
        </MenuItem>
        <MenuItem
          onClick={() =>
            this.action({
              action: 'CREATE',
              desc: { type: 'FILE', extension: '.js' },
            })
          }
          disabled={isLeaf}
        >
          <ListItemIcon>
            <LanguageJavascriptIcon fontSize="small" />
          </ListItemIcon>
          New JavaScript File
        </MenuItem>
        <MenuItem
          onClick={() =>
            this.action({
              action: 'CREATE',
              desc: { type: 'FILE', extension: '.blockly' },
            })
          }
          disabled={isLeaf}
        >
          <ListItemIcon>
            <LanguageBlocklyIcon fontSize="small" />
          </ListItemIcon>
          New Blockly File
        </MenuItem>
        <MenuItem
          onClick={() => this.action({ action: 'RENAME' })}
          disabled={isRoot}
        >
          <ListItemIcon>
            <RenameIcon fontSize="small" />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => this.action({ action: 'DELETE' })}
          disabled={isRoot}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    );
  }
}

export default FileMenu;
