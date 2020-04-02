// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import { Project } from '../../../core/store/projects';

const messages = defineMessages({
  title: {
    id: 'app.projects.rename_project_dialog.title',
    description: 'Title for the project rename dialog',
    defaultMessage: 'Rename project',
  },
  description: {
    id: 'app.projects.rename_project_dialog.description',
    description: 'Text for the project rename dialog',
    defaultMessage: "Please enter the project's new name.",
  },
  label: {
    id: 'app.projects.rename_project_dialog.new_name_label',
    description: "Label for the project creation dialog's text field",
    defaultMessage: 'Project Name',
  },
});

type PropTypes = {|
  onRename: (Project, string) => boolean | Promise<boolean>,
  allProjects: Project[],
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
        title={<M {...messages.title} />}
        description={<M {...messages.description} />}
        actions="OK_CANCEL"
        onCancel={() => this.cancel()}
        onConfirm={() => this.confirm()}
      >
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label={<M {...messages.label} />}
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
