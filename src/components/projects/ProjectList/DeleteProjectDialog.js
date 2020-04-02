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

type PropTypes = {|
  onDelete: Project => boolean | Promise<boolean>,
|};
type StateTypes = {|
  visible: boolean,
  config: {|
    project: Project,
  |} | null,
|};

class DeleteProjectDialog extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    visible: false,
    config: null,
  };

  show(project: Project) {
    this.setState({ visible: true, config: { project } });
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
      config: { project },
    } = this.state;

    // whether the deletion succeeded or not, we want to hide the dialog.
    // Thus, ignore the result of onDelete
    await this.props.onDelete(project);

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
      config: {
        project: { name },
      },
    } = this.state;

    return (
      <SimpleDialog
        id="delete-dialog"
        open={visible}
        valid
        title={<M {...messages.title} />}
        description={<M {...messages.description} values={{ name }} />}
        actions="OK_autofocus_CANCEL"
        onCancel={() => this.cancel()}
        onConfirm={() => this.confirm()}
      />
    );
  }
}

export default DeleteProjectDialog;
