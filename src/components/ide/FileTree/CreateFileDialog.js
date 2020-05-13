// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import TextField from '@material-ui/core/TextField';

import SimpleDialog from '../../misc/SimpleDialog';

import type { DirReference, FileType, FileDesc } from '.';

const messages = defineMessages({
  title: {
    id: 'app.ide.create_file_dialog.title',
    description: 'Title for the file creation dialog',
    defaultMessage: 'Create new {type, select, FILE {file} DIRECTORY {folder}}',
  },
  description: {
    id: 'app.ide.create_file_dialog.description',
    description: 'Text for the file creation dialog',
    defaultMessage:
      "Please enter the new {type, select, FILE {file's} DIRECTORY {folder's}} name.",
  },
});

type Props = {|
  onCreate: (
    parentDir: DirReference,
    newFileName: string,
    type: FileType,
  ) => boolean | Promise<boolean>,
|};
type Config = {|
  parentDir: DirReference,
  desc: FileDesc,
|};
type Instance = {|
  show(parentDir: DirReference, desc: FileDesc): void,
|};

function CreateFileDialog({ onCreate }: Props, ref: Ref<Instance>) {
  type FileNameState = {|
    newFileName: string,
    actualNewFileName: string,
    valid: boolean,
  |};

  const [visible, setVisible] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);
  const [fileNameState, setFileNameState] = React.useState<FileNameState>({
    newFileName: '',
    actualNewFileName: '',
    valid: false,
  });

  function show(parentDir: DirReference, desc: FileDesc) {
    setVisible(true);
    setConfig({ parentDir, desc });
    setFileNameState({
      newFileName: '',
      actualNewFileName: '',
      valid: false,
    });
  }
  function cancel() {
    setVisible(false);
  }
  function onChange(event) {
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { parentDir, desc } = config;

    const name = event.target.value;
    const newFileName = name.replace(/[^-\w#$%().,:; ]/g, '');
    const actualNewFileName =
      desc.type === 'DIRECTORY'
        ? newFileName
        : newFileName.endsWith(desc.extension)
        ? newFileName
        : `${newFileName}${desc.extension}`;
    const valid =
      newFileName !== '' &&
      parentDir.file.contents.every(f => f.name !== actualNewFileName);
    setFileNameState({
      newFileName,
      actualNewFileName,
      valid,
    });
  }
  async function confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { parentDir, desc } = config;
    const { actualNewFileName } = fileNameState;

    const success = await onCreate(parentDir, actualNewFileName, desc.type);
    if (success) {
      setVisible(false);
    }
  }

  React.useImperativeHandle(ref, () => ({ show }));

  // this will only trigger before the first showing.
  // after that, the old config is still present and will ensure that
  // fade out animations won't glitch due to changing contents.
  if (config === null) return null;

  const { desc } = config;
  const { newFileName, valid } = fileNameState;

  const placeholder = desc.type === 'FILE' ? `file${desc.extension}` : 'folder';

  return (
    <SimpleDialog
      id="create-file-dialog"
      open={visible}
      valid={valid}
      title={<M {...messages.title} values={{ type: desc.type }} />}
      description={<M {...messages.description} values={{ type: desc.type }} />}
      actions="OK_CANCEL"
      onCancel={cancel}
      onConfirm={confirm}
    >
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label={placeholder}
        type="text"
        value={newFileName}
        onChange={onChange}
        error={!valid}
        fullWidth
      />
    </SimpleDialog>
  );
}

export default React.forwardRef<Props, Instance>(CreateFileDialog);
