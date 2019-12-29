// @flow

import * as React from 'react';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import { Project } from '../../../core/store/projects';

type PropTypes = {|
  onRename: (Project, string) => boolean | Promise<boolean>,
  allProjects: Array<Project>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    project: Project,
  |} | null,
  newProjectName: string,
|};

class RenameProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
    newProjectName: '',
  };

  show(project: Project) {
    this.setState({
      visible: true,
      config: { project },
      newProjectName: project.name,
    });
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
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { project },
      newProjectName,
    } = this.state;

    const success = await this.props.onRename(project, newProjectName);
    if (success) {
      this.setState({ visible: false, newProjectName: '' });
    }
  }

  render() {
    const { visible, newProjectName } = this.state;

    const isValid = this.isValid();

    return (
      <SimpleDialog
        id="rename-dialog"
        open={visible}
        valid={isValid}
        title="Rename project"
        description="Please enter the project's new name."
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
          value={newProjectName}
          onChange={event => this.setNewProjectName(event.target.value)}
          error={!isValid}
          fullWidth
        />
      </SimpleDialog>
    );
  }
}

export default RenameProjectDialog;
