// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import type { RcTreeNodeEvent } from './RcTreeTypes';

type PropTypes = {|
  onRename: (RcTreeNodeEvent, string) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  file: RcTreeNodeEvent | null,
  siblingNodes: Array<any> | null,
  newFileName: string,
|};

class RenameFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    file: null,
    siblingNodes: null,
    newFileName: '',
  };

  show(file: RcTreeNodeEvent, siblingNodes: Array<any>) {
    this.setState({
      visible: true,
      file,
      siblingNodes,
      newFileName: file.props.title,
    });
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewFileName(name: string) {
    this.setState({ newFileName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValidFileName() {
    const { siblingNodes, newFileName } = this.state;

    if (siblingNodes === null) return false;

    return (
      newFileName !== '' &&
      siblingNodes.every(sibling => sibling.name !== newFileName)
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.file === null) throw 'no file';

    const success = await this.props.onRename(
      this.state.file,
      this.state.newFileName,
    );
    if (success) {
      this.setState({ visible: false });
    }
  }

  render() {
    const [label, placeholder] =
      (this.state.file === null ? true : this.state.file.props.isLeaf)
      ? ['file', 'file.js']
      : ['folder', 'folder'];

    return (
      <Dialog
        open={this.state.visible}
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
            value={this.state.newFileName}
            onChange={event => this.setNewFileName(event.target.value)}
            error={!this.isValidFileName()}
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
            disabled={!this.isValidFileName()}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default RenameFileDialog;
