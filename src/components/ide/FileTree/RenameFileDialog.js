// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import type { FileReference } from '.';

const messages = defineMessages({
  title: {
    id: 'app.ide.rename_file_dialog.title',
    description: 'Title for the file rename dialog',
    defaultMessage: 'Rename {type, select, FILE {file} DIRECTORY {folder}}',
  },
  description: {
    id: 'app.ide.rename_file_dialog.description',
    description: 'Text for the file rename dialog',
    defaultMessage:
      "Please enter the {type, select, FILE {file's} DIRECTORY {folder's}} new name.",
  },
});

type Props = {|
  onRename: (
    file: FileReference,
    newFileName: string,
  ) => boolean | Promise<boolean>,
|};
type Config = {|
  file: FileReference,
  siblingNames: string[],
|};
type Instance = {|
  show(file: FileReference, siblingNames: string[]): void,
|};

function RenameFileDialog({ onRename }: Props, ref: Ref<Instance>) {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);
  const [newFileName, setNewFileName] = React.useState<string>('');

  function show(file: FileReference, siblingNames: string[]) {
    setVisible(true);
    setConfig({ file, siblingNames });
    setNewFileName(file.file.name);
  }
  function cancel() {
    setVisible(false);
  }
  function onChange(event) {
    const name = event.target.value;
    const nameClean = name.replace(/[^-\w#$%().,:; ]/g, '');
    setNewFileName(nameClean);
  }
  async function confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { file } = config;

    const success = await onRename(file, newFileName);
    if (success) {
      setVisible(false);
    }
  }

  React.useImperativeHandle(ref, () => ({ show }));

  // this will only trigger before the first showing.
  // after that, the old config is still present and will ensure that
  // fade out animations won't glitch due to changing contents.
  if (config === null) return null;

  const { file, siblingNames } = config;

  const type = file.file.isDirectory() ? 'DIRECTORY' : 'FILE';

  const valid =
    newFileName !== '' && siblingNames.every(name => name !== newFileName);

  return (
    <SimpleDialog
      id="rename-file-dialog"
      open={visible}
      valid={valid}
      title={<M {...messages.title} values={{ type }} />}
      description={<M {...messages.description} values={{ type }} />}
      actions="OK_CANCEL"
      onCancel={cancel}
      onConfirm={confirm}
    >
      <TextField
        autoFocus
        margin="dense"
        id="name"
        type="text"
        value={newFileName}
        onChange={onChange}
        error={!valid}
        fullWidth
      />
    </SimpleDialog>
  );
}

export default React.forwardRef<Props, Instance>(RenameFileDialog);
