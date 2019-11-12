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
  onRename: (ProjectsDB.ProjectName, string) => boolean | Promise<boolean>,
  allProjects: Array<ProjectsDB.ProjectName>,
|};
type StateTypes = {|
  visible: boolean,
  projectName: ProjectsDB.ProjectName | null,
  newProjectName: string,
|};

class RenameProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    projectName: null,
    newProjectName: '',
  };

  show(projectName: ProjectsDB.ProjectName) {
    this.setState({
      visible: true,
      projectName,
      newProjectName: projectName,
    });
  }

  cancel() {
    this.setState({ visible: false });
  }

  setNewProjectName(name: string) {
    this.setState({ newProjectName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValidProjectName() {
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
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectName === null) throw 'no projectName';

    const success = await this.props.onRename(
      this.state.projectName,
      this.state.newProjectName,
    );
    if (success) {
      this.setState({ visible: false, newProjectName: '' });
    }
  }

  render() {
    return (
      <Dialog
        open={this.state.visible}
        onClose={() => this.cancel()}
        aria-labelledby="rename-dialog-title"
        aria-describedby="rename-dialog-description"
      >
        <DialogTitle id="rename-dialog-title">Rename project</DialogTitle>
        <DialogContent>
          <DialogContentText id="rename-dialog-description">
            Please enter the project&apos;s new name.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Project Name"
            type="text"
            value={this.state.newProjectName}
            onChange={event => this.setNewProjectName(event.target.value)}
            error={!this.isValidProjectName()}
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
            disabled={!this.isValidProjectName()}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default RenameProjectDialog;
