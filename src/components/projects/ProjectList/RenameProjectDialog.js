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

type Props = {|
  onRename: (Project, string) => boolean | Promise<boolean>,
  allProjects: Project[],
|};
type Config = {|
  project: Project,
|};
type Instance = {|
  show: (project: Project) => void,
|};

function RenameProjectDialog(
  { onRename, allProjects }: Props,
  ref: Ref<Instance>,
) {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);
  const [newProjectName, setNewProjectName] = React.useState<string>('');

  const show = (project: Project) => {
    setVisible(true);
    setConfig({ project });
    setNewProjectName(project.name);
  };
  const cancel = () => {
    setVisible(false);
  };
  const onChange = event => {
    const name = event.target.value;
    const nameClean = name.replace(/[^-\w#$%().,:; ]/g, '');
    setNewProjectName(nameClean);
  };
  const confirm = async () => {
    // eslint-disable-next-line no-throw-literal
    if (!visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { project } = config;

    const success = await onRename(project, newProjectName);
    if (success) {
      setVisible(false);
    }
  };

  React.useImperativeHandle(ref, () => ({ show }));

  const valid =
    newProjectName !== '' &&
    allProjects.every(project => project.name !== newProjectName);

  return (
    <SimpleDialog
      id="rename-dialog"
      open={visible}
      valid={valid}
      title={<M {...messages.title} />}
      description={<M {...messages.description} />}
      actions="OK_CANCEL"
      onCancel={cancel}
      onConfirm={confirm}
    >
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label={<M {...messages.label} />}
        type="text"
        value={newProjectName}
        onChange={onChange}
        error={!valid}
        fullWidth
      />
    </SimpleDialog>
  );
}

export default React.forwardRef<Props, Instance>(RenameProjectDialog);
