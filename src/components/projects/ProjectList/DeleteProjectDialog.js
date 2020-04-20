// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import SimpleDialog from '../../misc/SimpleDialog';

import { Project } from '../../../core/store/projects';

const messages = defineMessages({
  title: {
    id: 'app.projects.delete_project_dialog.title',
    description: 'Title for the project deletion dialog',
    defaultMessage: 'Confirm deletion',
  },
  description: {
    id: 'app.projects.delete_project_dialog.description',
    description: 'Text for the project deletion dialog',
    defaultMessage: 'Are you sure yo want to delete project "{name}"?',
  },
});

type Props = {|
  onDelete: Project => boolean | Promise<boolean>,
|};
type Config = {|
  project: Project,
|};
type Instance = {|
  show: (project: Project) => void,
|};

function DeleteProjectDialog({ onDelete }: Props, ref: Ref<Instance>) {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);

  const show = (project: Project) => {
    setVisible(true);
    setConfig({ project });
  };
  const cancel = () => {
    setVisible(false);
  };
  const confirm = async () => {
    // eslint-disable-next-line no-throw-literal
    if (!visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { project } = config;

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await onDelete(project);

    // we don't set the project to null because that results in a display glitch:
    // the hide animation will leave the project name visible for a split second
    setVisible(false);
  };

  React.useImperativeHandle(ref, () => ({ show }));

  // this will only trigger before the first showing.
  // after that, the old config is still present and will ensure that
  // fade out animations won't glitch due to changing contents.
  if (config === null) return null;

  const {
    project: { name },
  } = config;

  return (
    <SimpleDialog
      id="delete-dialog"
      open={visible}
      valid
      title={<M {...messages.title} />}
      description={<M {...messages.description} values={{ name }} />}
      actions="OK_autofocus_CANCEL"
      onCancel={cancel}
      onConfirm={confirm}
    />
  );
}

export default React.forwardRef<Props, Instance>(DeleteProjectDialog);
