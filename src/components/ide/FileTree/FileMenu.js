// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {
  FolderIcon,
  LanguageBlocklyIcon,
  LanguageJavascriptIcon,
  MetadataSimulatorIcon,
  MetadataToolboxIcon,
  RenameIcon,
  DeleteIcon,
  DownloadIcon,
  UploadIcon,
} from '../../misc/palette';

import type {
  FileDesc,
  MetadataDesc,
  FileReference,
  DirReference,
  FileAction,
} from '.';

const messages = defineMessages({
  createFolder: {
    id: 'app.ide.file_menu.create_folder',
    description: 'Menu item text for creating a folder',
    defaultMessage: 'New Folder',
  },
  createJavascriptFile: {
    id: 'app.ide.file_menu.create_js_file',
    description: 'Menu item text for creating a Javascript file',
    defaultMessage: 'New Javascript File',
  },
  createBlocklyFile: {
    id: 'app.ide.file_menu.create_blockly_file',
    description: 'Menu item text for creating a Blockly file',
    defaultMessage: 'New Blockly File',
  },
  createSimulatorConfiguration: {
    id: 'app.ide.file_menu.create_simulator_configuration',
    description: 'Menu item text for creating a simulator configuration',
    defaultMessage: 'Create Simulator Configuration',
  },
  createToolboxConfiguration: {
    id: 'app.ide.file_menu.create_toolbox_configuration',
    description: 'Menu item text for creating a Blockly toolbox configuration',
    defaultMessage: 'Create Toolbox Configuration',
  },
  rename: {
    id: 'app.ide.file_menu.rename',
    description: 'Menu item text for renaming a file',
    defaultMessage: 'Rename',
  },
  delete: {
    id: 'app.ide.file_menu.delete',
    description: 'Menu item text for deleting a file',
    defaultMessage: 'Delete',
  },
  upload: {
    id: 'app.ide.file_menu.upload',
    description: 'Menu item text for creating a file via upload',
    defaultMessage: 'Upload',
  },
  download: {
    id: 'app.ide.file_menu.download',
    description: 'Menu item text for downloading a file from the IDE',
    defaultMessage: 'Download',
  },
});

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

  handleCreate(desc: FileDesc | MetadataDesc) {
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

  handleDownload() {
    this.action(file => ({ action: 'DOWNLOAD', file }));
  }

  handleUpload() {
    this.action(file => {
      // $FlowExpectError
      const parentDir: DirReference = file;

      return { action: 'UPLOAD', parentDir };
    });
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
    const isMetadata = file.path === './.metadata' && !isLeaf;

    type FileMenuItemProps = {|
      titleMsg: Object,
      icon: Class<React.Component<any>>,
      ...any,
    |};

    const FileMenuItem = React.forwardRef(
      (
        { titleMsg, icon: TheIcon, ...props }: FileMenuItemProps,
        ref: Ref<MenuItem>,
      ) => (
        <MenuItem ref={ref} {...props}>
          <ListItemIcon>
            <TheIcon fontSize="small" />
          </ListItemIcon>
          <M {...titleMsg} />
        </MenuItem>
      ),
    );

    return (
      <Menu
        keepMounted
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        open={visible}
        onClose={() => this.hide()}
      >
        {[
          ...(!isLeaf
            ? [
                <FileMenuItem
                  key="create_directory"
                  titleMsg={messages.createFolder}
                  onClick={() => this.handleCreate({ type: 'DIRECTORY' })}
                  icon={FolderIcon}
                />,
                ...(isMetadata
                  ? [
                      <FileMenuItem
                        key="create_simulator_config"
                        titleMsg={messages.createSimulatorConfiguration}
                        onClick={() =>
                          this.handleCreate({
                            type: 'METADATA',
                            name: 'simulator',
                          })
                        }
                        icon={MetadataSimulatorIcon}
                      />,
                      <FileMenuItem
                        key="create_toolbox_config"
                        titleMsg={messages.createToolboxConfiguration}
                        onClick={() =>
                          this.handleCreate({
                            type: 'METADATA',
                            name: 'toolbox',
                          })
                        }
                        icon={MetadataToolboxIcon}
                      />,
                    ]
                  : [
                      <FileMenuItem
                        key="create_js_file"
                        titleMsg={messages.createJavascriptFile}
                        onClick={() =>
                          this.handleCreate({ type: 'FILE', extension: '.js' })
                        }
                        icon={LanguageJavascriptIcon}
                      />,
                      <FileMenuItem
                        key="create_blockly_file"
                        titleMsg={messages.createBlocklyFile}
                        onClick={() =>
                          this.handleCreate({
                            type: 'FILE',
                            extension: '.blockly',
                          })
                        }
                        icon={LanguageBlocklyIcon}
                      />,
                    ]),
                <Divider key="divider-directory" />,
              ]
            : []),
          <FileMenuItem
            key="rename"
            titleMsg={messages.rename}
            onClick={() => this.handleRename()}
            disabled={isRoot}
            icon={RenameIcon}
          />,
          <FileMenuItem
            key="delete"
            titleMsg={messages.delete}
            onClick={() => this.handleDelete()}
            disabled={isRoot}
            icon={DeleteIcon}
          />,
          <Divider key="divider-upload-download" />,
          ...(!isLeaf
            ? [
                <FileMenuItem
                  key="upload"
                  titleMsg={messages.upload}
                  onClick={() => this.handleUpload()}
                  icon={UploadIcon}
                />,
              ]
            : [
                <FileMenuItem
                  key="download"
                  titleMsg={messages.download}
                  onClick={() => this.handleDownload()}
                  icon={DownloadIcon}
                />,
              ]),
        ]}
      </Menu>
    );
  }
}

export default FileMenu;
