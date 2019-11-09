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

import type { TreeNodeProps } from './FileTree';

type PropTypes = {|
  onCreate: (TreeNodeProps, string) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  parentNode: TreeNodeProps | null,
  newFolderName: string,
|};

class CreateFolderDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    parentNode: null,
    newFolderName: '',
  };

  show(parentNode: TreeNodeProps) {
    this.setState({ visible: true, parentNode });
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewFolderName(name: string) {
    this.setState({ newFolderName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValid() {
    const { parentNode, newFolderName } = this.state;

    // eslint-disable-next-line no-throw-literal
    if (parentNode === null || !this.state.visible) return false;

    return (
      newFolderName !== '' &&
      parentNode.children.every(node => node.props.title !== newFolderName)
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';

    const { parentNode, newFolderName } = this.state;

    // eslint-disable-next-line no-throw-literal
    if (parentNode === null) throw 'unreachable';

    const success = await this.props.onCreate(parentNode, this.state.newFolderName);
    if (success) {
      this.setState({ visible: false, newFolderName: '' });
    }
  }

  render() {
    return (
      <Dialog
        open={this.state.visible}
        onClose={() => this.cancel()}
        aria-labelledby="create-folder-dialog-title"
        aria-describedby="create-folder-dialog-description"
      >
        <DialogTitle id="create-folder-dialog-title">Create new folder</DialogTitle>
        <DialogContent>
          <DialogContentText id="create-folder-dialog-description">
            Please enter the new folder&apos;s name.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="folder"
            type="text"
            value={this.state.newFolderName}
            onChange={event => this.setNewFolderName(event.target.value)}
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

export default CreateFolderDialog;
