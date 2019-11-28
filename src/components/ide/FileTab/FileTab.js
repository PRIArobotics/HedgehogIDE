// @flow

import * as React from 'react';

import { fs } from 'filer';

import { Project } from '../../../core/store/projects';

type PropTypes = {|
  project: Project,
  path: string,
  children: (
    content: string | null,
    onContentChange: (content: string) => void | Promise<void>,
  ) => React.Node,
|};
type StateTypes = {|
  content: string | null,
|};

class FileTab extends React.Component<PropTypes, StateTypes> {
  state = {
    content: null,
  };

  constructor(props: PropTypes) {
    super(props);

    this.refreshFile();
  }

  async refreshFile() {
    const { project, path } = this.props;
    const absolutePath = project.resolve(path);

    const content = await fs.promises.readFile(absolutePath, 'utf8');
    this.setState({ content });
  }

  setContent(content: string) {
    // only set content if the current content is not null,
    // i.e. the original file contents were loaded successfully,
    // and subsequently persist that content
    this.setState(
      ({ content: oldContent }) => (oldContent === null ? {} : { content }),
      () => this.save(),
    );
  }

  async save() {
    const { project, path } = this.props;
    const { content } = this.state;

    // if the content was not loaded yet for whatever reason,
    // don't delete existing file contents.
    if (content === null) return;

    const absolutePath = project.resolve(path);

    await fs.promises.writeFile(absolutePath, this.state.content, 'utf8');
  }

  render() {
    const { children } = this.props;
    const { content } = this.state;

    return children(content, (newContent: string) => {
      this.setContent(newContent);
    });
  }
}

export default FileTab;
