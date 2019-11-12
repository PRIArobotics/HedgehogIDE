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

type PropTypes = {|
  onCreate: string => boolean | Promise<boolean>,
  allProjects: Array<ProjectsDB.ProjectName>,
|};
type StateTypes = {|
  visible: boolean,
  newProjectName: string,
|};

class CreateProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    newProjectName: '',
  };

  show() {
    this.setState({ visible: true });
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewProjectName(name: string) {
    this.setState({ newProjectName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValid() {
    const { allProjects } = this.props;
    const { newProjectName } = this.state;
    return (
      newProjectName !== '' &&
      allProjects.every(project => project !== newProjectName)
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';

    const success = await this.props.onCreate(this.state.newProjectName);
    if (success) {
      this.setState({ visible: false, newProjectName: '' });
    }
  }

  render() {
    return (
      <Dialog
        open={this.state.visible}
        onClose={() => this.cancel()}
        aria-labelledby="create-dialog-title"
        aria-describedby="create-dialog-description"
      >
        <DialogTitle id="create-dialog-title">Create new project</DialogTitle>
        <DialogContent>
          <DialogContentText id="create-dialog-description">
            Please enter the new project&apos;s name.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Project Name"
            type="text"
            value={this.state.newProjectName}
            onChange={event => this.setNewProjectName(event.target.value)}
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

export default CreateProjectDialog;
