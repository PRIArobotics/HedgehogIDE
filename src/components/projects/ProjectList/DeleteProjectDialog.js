// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { Project } from '../../../core/store/projects';

type PropTypes = {|
  onDelete: Project => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  project: Project | null,
|};

class DeleteProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    project: null,
  };

  show(project: Project) {
    this.setState({ visible: true, project });
  }

  cancel() {
    this.setState({ visible: false });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.project === null) throw 'no project';

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(this.state.project);

    // we don't set the project to null because that results in a display glitch:
    // the hide animation will leave the project name visible for a split second
    this.setState({ visible: false });
  }

  render() {
    return (
      <Dialog
        open={this.state.visible}
        onClose={() => this.cancel()}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure yo want to delete project &quot;
            {(this.state.project || {}).name}&quot;?
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

export default DeleteProjectDialog;
