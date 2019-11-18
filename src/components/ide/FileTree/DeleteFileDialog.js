// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import type { RcTreeNodeEvent } from './RcTreeTypes';

type PropTypes = {|
  onDelete: RcTreeNodeEvent => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  file: RcTreeNodeEvent | null,
|};

class DeleteFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    file: null,
  };

  show(file: RcTreeNodeEvent) {
    this.setState({ visible: true, file });
  }

  cancel() {
    this.setState({ visible: false });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.file === null) throw 'no file';

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(this.state.file);

    // we don't set the project to null because that results in a display glitch:
    // the hide animation will leave the project name visible for a split second
    this.setState({ visible: false });
  }

  render() {
    const label =
      (this.state.file === null ? true : this.state.file.props.isLeaf)
      ? 'file'
      : 'folder';
    const name = this.state.file === null ? '' : this.state.file.props.title;

    return (
      <Dialog
        open={this.state.visible}
        onClose={() => this.cancel()}
        aria-labelledby="delete-file-dialog-title"
        aria-describedby="delete-file-dialog-description"
      >
        <DialogTitle id="delete-file-dialog-title">Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-file-dialog-description">
            Are you sure yo want to delete {label} &quot;{name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.cancel()} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => this.confirm()} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteFileDialog;
