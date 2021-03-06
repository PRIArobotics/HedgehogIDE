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
      'Are you sure you want to delete {type, select, FILE {file} DIRECTORY {folder}} "{name}"?',
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

type DeleteFileDialogHook = {|
  show(file: FileReference): void,
  mountSimpleDialog(): MountedSimpleDialogProps,
|};

type Config = {|
  file: FileReference,
|};

export default function useDeleteFileDialog(
  onDelete: (file: FileReference) => boolean | Promise<boolean>,
): DeleteFileDialogHook {
  const [open, setOpen] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);

  function show(file: FileReference) {
    setOpen(true);
    setConfig({ file });
  }

  function onCancel() {
    setOpen(false);
  }

  async function onConfirm() {
    // eslint-disable-next-line no-throw-literal
    if (!open) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { file } = config;

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await onDelete(file);

    // we don't set the file to null because that results in a display glitch:
    // the hide animation will leave the file name visible for a split second
    setOpen(false);
  }

  const file = config?.file.file;
  const name = file?.name ?? '';
  const type = file?.isDirectory() ?? false ? 'DIRECTORY' : 'FILE';

  return {
    show,
    mountSimpleDialog() {
      return {
        open,
        valid: true,
        title: <M {...messages.title} />,
        description: <M {...messages.description} values={{ type, name }} />,
        actions: 'OK_autofocus_CANCEL',
        onCancel,
        onConfirm,
      };
    },
  };
}
