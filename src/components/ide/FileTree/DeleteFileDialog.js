// @flow

import * as React from 'react';

import SimpleDialog from '../../misc/SimpleDialog';

import type { FileReference } from '.';

type PropTypes = {|
  onDelete: (file: FileReference) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    file: FileReference,
  |} | null,
|};

class DeleteFileDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
  };

  show(file: FileReference) {
    this.setState({ visible: true, config: { file } });
  }

  cancel() {
    this.setState({ visible: false });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { file },
    } = this.state;

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(file);

    // we don't set the project to null because that results in a display glitch:
    // the hide animation will leave the project name visible for a split second
    this.setState({ visible: false });
  }

  render() {
    // this will only trigger before the first showing.
    // after that, the old config is still present and will ensure that
    // fade out animations won't glitch due to changing contents.
    if (this.state.config === null) return null;

    const {
      visible,
      config: { file },
    } = this.state;

    const label = file.file.isDirectory() ? 'folder' : 'file';
    const { name } = file.file;

    return (
      <SimpleDialog
        id="delete-file-dialog"
        open={visible}
        valid
        title="Confirm deletion"
        description={`Are you sure yo want to delete ${label} "${name}"?`}
        actions="OK_autofocus_CANCEL"
        onCancel={() => this.cancel()}
        onConfirm={() => this.confirm()}
      />
    );
  }
}

export default DeleteFileDialog;
