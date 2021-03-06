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
    defaultMessage: "Please enter the new {type, select, FILE {file's} DIRECTORY {folder's}} name.",
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

type CreateFileDialogHook = {|
  show(parentDir: DirReference, desc: FileDesc): void,
  mountSimpleDialog(): MountedSimpleDialogProps,
|};

type Config = {|
  parentDir: DirReference,
  desc: FileDesc,
|};

type FileNameState = {|
  actualNewFileName: string,
  valid: boolean,
|};

export default function useCreateFileDialog(
  onCreate: (
    parentDir: DirReference,
    newFileName: string,
    type: FileType,
  ) => boolean | Promise<boolean>,
): CreateFileDialogHook {
  const [open, setOpen] = React.useState<boolean>(false);
  const [config, setConfig] = React.useState<Config | null>(null);
  const [newFileName, setNewFileName] = React.useState<string>('');

  function show(parentDir: DirReference, desc: FileDesc) {
    setOpen(true);
    setConfig({ parentDir, desc });
    setNewFileName('');
  }

  function onCancel() {
    setOpen(false);
  }

  function onChange(event) {
    const name = event.target.value;
    const nameClean = name.replace(/[^-\w#$%().,:; ]/g, '');
    setNewFileName(nameClean);
  }

  const [fileNameState, setFileNameState] = React.useState<FileNameState>({
    actualNewFileName: '',
    valid: false,
  });
  React.useEffect(() => {
    if (config === null) return;

    const { parentDir, desc } = config;

    const actualNewFileName =
      desc.type === 'DIRECTORY' || newFileName.endsWith(desc.extension)
        ? newFileName
        : `${newFileName}${desc.extension}`;
    const valid =
      newFileName !== '' && parentDir.file.contents.every((f) => f.name !== actualNewFileName);
    setFileNameState({
      actualNewFileName,
      valid,
    });
  }, [config, newFileName]);

  async function onConfirm() {
    // eslint-disable-next-line no-throw-literal
    if (!open) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (config === null) throw 'unreachable';

    const { parentDir, desc } = config;
    const { actualNewFileName } = fileNameState;

    const success = await onCreate(parentDir, actualNewFileName, desc.type);
    if (success) {
      setOpen(false);
    }
  }

  const desc = config?.desc ?? { type: 'DIRECTORY' };
  const { type } = desc;
  const { valid } = fileNameState;

  const placeholder = desc.type === 'FILE' ? `file${desc.extension}` : 'folder';

  return {
    show,
    mountSimpleDialog() {
      return {
        open,
        valid,
        title: <M {...messages.title} values={{ type }} />,
        description: <M {...messages.description} values={{ type }} />,
        actions: 'OK_CANCEL',
        onCancel,
        onConfirm,
        children: (
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
        ),
      };
    },
  };
}
