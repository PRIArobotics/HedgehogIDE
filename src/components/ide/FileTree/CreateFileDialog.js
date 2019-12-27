// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
