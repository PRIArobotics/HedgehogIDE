// @flow

import * as React from 'react';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import type { DirReference, FileType, FileDesc } from '.';

type PropTypes = {|
  onCreate: (
    parentDir: DirReference,
    newFileName: string,
    type: FileType,
  ) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    parentDir: DirReference,
    desc: FileDesc,
  |} | null,
  newFileName: string,
  actualNewFileName: string,
  isValid: boolean,
|};

class CreateFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
    newFileName: '',
    actualNewFileName: '',
    isValid: false,
  };

  show(parentDir: DirReference, desc: FileDesc) {
    this.setState(
      {
        visible: true,
        config: { parentDir, desc },
      },
      () => this.setNewFileName(''),
    );
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewFileName(name: string) {
    this.setState(state => {
      // eslint-disable-next-line no-throw-literal
      if (state.config === null) throw 'unreachable';

      const {
        config: { parentDir, desc },
      } = state;

      const newFileName = name.replace(/[^-\w#$%().,:; ]/g, '');
      const actualNewFileName =
        desc.type === 'DIRECTORY'
          ? newFileName
          : newFileName.endsWith(desc.extension)
          ? newFileName
          : `${newFileName}${desc.extension}`;
      const isValid =
        newFileName !== '' &&
        parentDir.file.contents.every(f => f.name !== actualNewFileName);

      return { newFileName, actualNewFileName, isValid };
    });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { parentDir, desc },
      actualNewFileName,
    } = this.state;

    const success = await this.props.onCreate(
      parentDir,
      actualNewFileName,
      desc.type,
    );
    if (success) {
      this.setState({ visible: false });
    }
  }

  render() {
    // this will only trigger before the first showing.
    // after that, the old config is still present and will ensure that
    // fade out animations won't glitch due to changing contents.
    if (this.state.config === null) return null;

    const {
      visible,
      config: { desc },
      newFileName,
      isValid,
    } = this.state;

    const label = desc.type === 'FILE' ? 'file' : 'folder';
    const placeholder =
      desc.type === 'FILE' ? `file${desc.extension}` : 'folder';

    return (
      <SimpleDialog
        id="create-file-dialog"
        open={visible}
        valid={isValid}
        title={`Create new ${label}`}
        description={`Please enter the new ${label}'s name.`}
        actions="OK_CANCEL"
        onCancel={() => this.cancel()}
        onConfirm={() => this.confirm()}
      >
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label={placeholder}
          type="text"
          value={newFileName}
          onChange={event => this.setNewFileName(event.target.value)}
          error={!isValid}
          fullWidth
        />
      </SimpleDialog>
    );
  }
}

export default CreateFileDialog;
