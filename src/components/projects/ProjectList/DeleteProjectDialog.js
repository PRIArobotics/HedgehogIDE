// @flow

import * as React from 'react';

import SimpleDialog from '../../misc/SimpleDialog';

import { Project } from '../../../core/store/projects';

type PropTypes = {|
  onDelete: Project => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  project: Project | null,
|};

class DeleteProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    project: null,
  };

  show(project: Project) {
    this.setState({ visible: true, project });
  }

  cancel() {
    this.setState({ visible: false });
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (!this.state.visible) throw 'confirming when dialog is not shown';
    // eslint-disable-next-line no-throw-literal
    if (this.state.project === null) throw 'no project';

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(this.state.project);

    // we don't set the project to null because that results in a display glitch:
    // the hide animation will leave the project name visible for a split second
    this.setState({ visible: false });
  }

  render() {
    return (
      <SimpleDialog
        id="delete-dialog"
        open={this.state.visible}
        valid
        title="Confirm deletion"
        description={`Are you sure yo want to delete project "${
          (this.state.project || {}).name
        }"?`}
        actions="OK_autofocus_CANCEL"
        onCancel={() => this.cancel()}
        onConfirm={() => this.confirm()}
      />
    );
  }
}

export default DeleteProjectDialog;
