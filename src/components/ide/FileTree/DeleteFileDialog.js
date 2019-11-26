// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import type { RcTreeNodeEvent } from './RcTreeTypes';
import type { FileReference } from '.';

type PropTypes = {|
  onDelete: (file: FileReference) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    file: FileReference,
  |} | null,
|};

class DeleteFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
  };

  show(file: FileReference) {
    this.setState({ visible: true, config: { file } });
  }

  cancel() {
    this.setState({ visible: false });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { file },
    } = this.state;

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(file);

    // we don't set the project to null because that results in a display glitch:
    // the hide animation will leave the project name visible for a split second
    this.setState({ visible: false });
  }

  render() {
    // this will only trigger before the first showing.
    // after that, the old config is still present and will ensure that
    // fade out animations won't glitch due to changing contents.
    if (this.state.config === null) return null;

    const {
      visible,
      config: { file },
    } = this.state;

    const label = file.file.isDirectory() ? 'folder' : 'file';
    const { name } = file.file;

    return (
      <Dialog
        open={visible}
        onClose={() => this.cancel()}
        aria-labelledby="delete-file-dialog-title"
        aria-describedby="delete-file-dialog-description"
      >
        <DialogTitle id="delete-file-dialog-title">
          Confirm deletion
        </DialogTitle>
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
