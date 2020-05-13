// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import SimpleDialog from '../../misc/SimpleDialog';

import type { FileReference } from '.';

const messages = defineMessages({
  title: {
    id: 'app.ide.delete_file_dialog.title',
    description: 'Title for the file deletion dialog',
    defaultMessage: 'Confirm deletion',
  },
  description: {
    id: 'app.ide.delete_file_dialog.description',
    description: 'Text for the file deletion dialog',
    defaultMessage:
      'Are you sure yo want to delete {type, select, FILE {file} DIRECTORY {folder}} "{name}"?',
  },
});

type Props = {|
  onDelete: (file: FileReference) => boolean | Promise<boolean>,
|};
type Config = {|
  file: FileReference,
|};
type Instance = {|
  show(file: FileReference): void,
|};

function DeleteFileDialog({ onDelete }: Props, ref: Ref<Instance>) {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);

  function show(file: FileReference) {
    setVisible(true);
    setConfig({ file });
  }
  function cancel() {
    setVisible(false);
  }
  async function confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { file } = config;

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await onDelete(file);

    // we don't set the file to null because that results in a display glitch:
    // the hide animation will leave the file name visible for a split second
    setVisible(false);
  }

  React.useImperativeHandle(ref, () => ({ show }));

  // this will only trigger before the first showing.
  // after that, the old config is still present and will ensure that
  // fade out animations won't glitch due to changing contents.
  if (config === null) return null;

  const { file } = config;
  const { name } = file.file;
  const type = file.file.isDirectory() ? 'DIRECTORY' : 'FILE';

  return (
    <SimpleDialog
      id="delete-file-dialog"
      open={visible}
      valid
      title={<M {...messages.title} />}
      description={<M {...messages.description} values={{ type, name }} />}
      actions="OK_autofocus_CANCEL"
      onCancel={cancel}
      onConfirm={confirm}
    />
  );
}

export default React.forwardRef<Props, Instance>(DeleteFileDialog);
