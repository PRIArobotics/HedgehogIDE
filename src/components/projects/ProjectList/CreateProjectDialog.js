// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import { Project } from '../../../core/store/projects';

const messages = defineMessages({
  title: {
    id: 'app.projects.create_project_dialog.title',
    description: 'Title for the project creation dialog',
    defaultMessage: 'Create new project',
  },
  description: {
    id: 'app.projects.create_project_dialog.description',
    description: 'Text for the project creation dialog',
    defaultMessage: "Please enter the new project's name.",
  },
  label: {
    id: 'app.projects.create_project_dialog.new_name_label',
    description: "Label for the project creation dialog's text field",
    defaultMessage: 'Project Name',
  },
});

type Props = {|
  onCreate: string => boolean | Promise<boolean>,
  allProjects: Project[],
|};
type Instance = {|
  show: () => void,
|};

function CreateProjectDialog(
  { onCreate, allProjects }: Props,
  ref: Ref<Instance>,
) {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [newProjectName, setNewProjectName] = React.useState<string>('');

  const show = () => {
    setVisible(true);
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

    const success = await onCreate(newProjectName);
    if (success) {
      setVisible(false);
      setNewProjectName('');
    }
  };

  React.useImperativeHandle(ref, () => ({ show }));

  const valid =
    newProjectName !== '' &&
    allProjects.every(project => project.name !== newProjectName);

  return (
    <SimpleDialog
      id="create-dialog"
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

export default React.forwardRef<Props, Instance>(CreateProjectDialog);
