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

import type { FileDesc, FileReference, DirReference, FileAction } from '.';

type Position = {|
  left: number,
  top: number,
|};

type PropTypes = {|
  onFileAction: (action: FileAction) => void | Promise<void>,
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

  action(mkAction: (file: FileReference) => FileAction) {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'menu is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { file },
    } = this.state;
    const action = mkAction(file);

    this.hide();
    this.props.onFileAction(action);
  }

  handleCreate(desc: FileDesc) {
    this.action(file => {
      // $FlowExpectError
      const parentDir: DirReference = file;

      return { action: 'CREATE', parentDir, desc };
    });
  }

  handleRename() {
    this.action(file => ({ action: 'RENAME', file }));
  }

  handleDelete() {
    this.action(file => ({ action: 'DELETE', file }));
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

    type FileMenuItemProps = {|
      title: string,
      onClick: () => void | Promise<void>,
      disabled: boolean,
      icon: Class<React.Component<any>>,
    |};

    function FileMenuItem({
      title,
      onClick,
      disabled,
      icon: TheIcon,
    }: FileMenuItemProps) {
      return (
        <MenuItem onClick={onClick} disabled={disabled}>
          <ListItemIcon>
            <TheIcon fontSize="small" />
          </ListItemIcon>
          {title}
        </MenuItem>
      );
    }

    return (
      <Menu
        keepMounted
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        open={visible}
        onClose={() => this.hide()}
      >
        <FileMenuItem
          title="New Folder"
          onClick={() => this.handleCreate({ type: 'DIRECTORY' })}
          disabled={isLeaf}
          icon={FolderIcon}
        />
        <FileMenuItem
          title="New JavaScript File"
          onClick={() => this.handleCreate({ type: 'FILE', extension: '.js' })}
          disabled={isLeaf}
          icon={LanguageJavascriptIcon}
        />
        <FileMenuItem
          title="New Blockly File"
          onClick={() => this.handleCreate({ type: 'FILE', extension: '.blockly' })}
          disabled={isLeaf}
          icon={LanguageBlocklyIcon}
        />
        <FileMenuItem
          title="Rename"
          onClick={() => this.handleRename()}
          disabled={isRoot}
          icon={RenameIcon}
        />
        <FileMenuItem
          title="Delete"
          onClick={() => this.handleDelete()}
          disabled={isRoot}
          icon={DeleteIcon}
        />
      </Menu>
    );
  }
}

export default FileMenu;
