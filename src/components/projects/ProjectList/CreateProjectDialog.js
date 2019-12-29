// @flow

import * as React from 'react';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import { Project } from '../../../core/store/projects';

type PropTypes = {|
  onCreate: string => boolean | Promise<boolean>,
  allProjects: Array<Project>,
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
      allProjects.every(project => project.name !== newProjectName)
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
      <SimpleDialog
        id="create-dialog"
        open={this.state.visible}
        valid={this.isValid()}
        title="Create new project"
        description="Please enter the new project's name."
        actions="OK_CANCEL"
        onCancel={() => this.cancel()}
        onConfirm={() => this.confirm()}
      >
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
      </SimpleDialog>
    );
  }
}

export default CreateProjectDialog;
