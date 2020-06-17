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

type SimpleDialogProps = React.ElementProps<typeof SimpleDialog>;

// this type has all properties that are generated by mountSimpleDialog()
type MountedSimpleDialogProps = $Diff<
  SimpleDialogProps,
  // these are the ones that aren't
  {|
    id: $PropertyType<SimpleDialogProps, 'id'>,
  |},
>;

type CreateProjectDialogHook = {|
  show(): void,
  mountSimpleDialog(): MountedSimpleDialogProps,
|};

export default function useCreateProjectDialog(
  onCreate: string => boolean | Promise<boolean>,
  allProjects: Project[],
): CreateProjectDialogHook {
  const [open, setOpen] = React.useState<boolean>(false);
  const [newProjectName, setNewProjectName] = React.useState<string>('');

  function show() {
    setOpen(true);
    setNewProjectName('');
  }

  function onCancel() {
    setOpen(false);
  }

  function onChange(event) {
    const name = event.target.value;
    const nameClean = name.replace(/[^-\w#$%().,:; ]/g, '');
    setNewProjectName(nameClean);
  }

  async function onConfirm() {
    // eslint-disable-next-line no-throw-literal
    if (!open) throw 'dialog is not shown';

    const success = await onCreate(newProjectName);
    if (success) {
      setOpen(false);
    }
  }

  const valid =
    newProjectName !== '' && allProjects.every(project => project.name !== newProjectName);

  return {
    show,
    mountSimpleDialog() {
      return {
        open,
        valid,
        title: <M {...messages.title} />,
        description: <M {...messages.description} />,
        actions: 'OK_CANCEL',
        onCancel,
        onConfirm,
        children: (
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
        ),
      };
    },
  };
}
