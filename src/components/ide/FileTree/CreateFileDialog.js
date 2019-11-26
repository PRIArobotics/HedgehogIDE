// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import type { DirReference, FileType } from '.';

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
    type: FileType,
  |} | null,
  newFileName: string,
|};

class CreateFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
    newFileName: '',
  };

  show(parentDir: DirReference, type: FileType) {
    this.setState({
      visible: true,
      config: { parentDir, type },
      newFileName: '',
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
      config: { parentDir },
      newFileName,
    } = this.state;

    return (
      newFileName !== '' &&
      parentDir.file.contents.every(f => f.name !== newFileName)
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { parentDir, type },
      newFileName,
    } = this.state;

    const success = await this.props.onCreate(parentDir, newFileName, type);
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
      config: { type },
      newFileName,
    } = this.state;

    const label = type === 'FILE' ? 'file' : 'folder';
    const placeholder = type === 'FILE' ? 'file.js' : 'folder';
    const isValid = this.isValid();

    return (
      <Dialog
        open={visible}
        onClose={() => this.cancel()}
        aria-labelledby="create-file-dialog-title"
        aria-describedby="create-file-dialog-description"
      >
        <DialogTitle id="create-file-dialog-title">
          Create new {label}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="create-file-dialog-description">
            Please enter the new {label}&apos;s name.
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

export default CreateFileDialog;
