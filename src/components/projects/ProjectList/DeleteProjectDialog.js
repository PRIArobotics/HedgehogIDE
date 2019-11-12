// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import * as ProjectsDB from '../../../core/store/projects';

type PropTypes = {|
  onDelete: ProjectsDB.ProjectName => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  projectName: ProjectsDB.ProjectName | null,
|};

class DeleteProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    projectName: null,
  };

  show(projectName: ProjectsDB.ProjectName) {
    this.setState({ visible: true, projectName });
  }

  cancel() {
    this.setState({ visible: false });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectName === null) throw 'no projectToDelete';

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(this.state.projectName);

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
            {this.state.projectName}&quot;?
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
