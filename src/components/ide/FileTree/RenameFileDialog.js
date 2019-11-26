// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import type { FilerStatInfo } from '../../../core/store/projects';

import type { RcTreeNodeEvent } from './RcTreeTypes';
import type { FileReference, DirReference } from '.';

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
      <Dialog
        open={visible}
        onClose={() => this.cancel()}
        aria-labelledby="rename-file-dialog-title"
        aria-describedby="rename-file-dialog-description"
      >
        <DialogTitle id="rename-file-dialog-title">Rename {label}</DialogTitle>
        <DialogContent>
          <DialogContentText id="rename-file-dialog-description">
            Please enter the {label}&apos;s new name.
          </DialogContentText>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.cancel()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => this.confirm()}
            color="primary"
            disabled={!isValid}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default RenameFileDialog;
