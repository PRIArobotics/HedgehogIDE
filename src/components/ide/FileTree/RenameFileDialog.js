// @flow

import * as React from 'react';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import type { FileReference } from '.';

type PropTypes = {|
  onRename: (
    file: FileReference,
    newFileName: string,
  ) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    file: FileReference,
    siblingNames: Array<string>,
  |} | null,
  newFileName: string,
|};

class RenameFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
    newFileName: '',
  };

  show(file: FileReference, siblingNames: Array<string>) {
    this.setState({
      visible: true,
      config: {
        file,
        siblingNames,
      },
      newFileName: file.file.name,
    });
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewFileName(name: string) {
    this.setState({ newFileName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValid() {
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { siblingNames },
      newFileName,
    } = this.state;

    return (
      newFileName !== '' && siblingNames.every(name => name !== newFileName)
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { file },
      newFileName,
    } = this.state;

    const success = await this.props.onRename(file, newFileName);
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
      config: { file },
      newFileName,
    } = this.state;

    const label = file.file.isDirectory() ? 'folder' : 'file';
    const placeholder =
      file.file.isDirectory() === 'FILE' ? 'folder' : 'file.js';
    const isValid = this.isValid();

    return (
      <SimpleDialog
        id="rename-dialog"
        open={this.state.visible}
        valid={isValid}
        title={`Rename ${label}`}
        description={`Please enter the ${label}'s new name.`}
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

export default RenameFileDialog;
