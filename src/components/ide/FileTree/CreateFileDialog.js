// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import * as ProjectsDB from '../../../core/store/projects';

import type { RcTreeNodeEvent } from './RcTreeTypes';

type PropTypes = {|
  onCreate: (RcTreeNodeEvent, string) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  parentNode: RcTreeNodeEvent | null,
  newFileName: string,
|};

class CreateFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    parentNode: null,
    newFileName: '',
  };

  show(parentNode: RcTreeNodeEvent) {
    this.setState({ visible: true, parentNode });
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewFileName(name: string) {
    this.setState({ newFileName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValid() {
    const { parentNode, newFileName } = this.state;

    // eslint-disable-next-line no-throw-literal
    if (parentNode === null || !this.state.visible) return false;

    return (
      newFileName !== '' &&
      parentNode.props.children.every(node => node.props.title !== newFileName)
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';

    const { parentNode, newFileName } = this.state;

    // eslint-disable-next-line no-throw-literal
    if (parentNode === null) throw 'unreachable';

    const success = await this.props.onCreate(parentNode, this.state.newFileName);
    if (success) {
      this.setState({ visible: false, newFileName: '' });
    }
  }

  render() {
    return (
      <Dialog
        open={this.state.visible}
        onClose={() => this.cancel()}
        aria-labelledby="create-file-dialog-title"
        aria-describedby="create-file-dialog-description"
      >
        <DialogTitle id="create-file-dialog-title">Create new file</DialogTitle>
        <DialogContent>
          <DialogContentText id="create-file-dialog-description">
            Please enter the new file&apos;s name.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="file.js"
            type="text"
            value={this.state.newFileName}
            onChange={event => this.setNewFileName(event.target.value)}
            error={!this.isValid()}
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
            disabled={!this.isValid()}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default CreateFileDialog;
