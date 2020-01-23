// @flow

import * as React from 'react';

import type { DirReference } from '.';

type PropTypes = {|
  onUpload: (
    parentDir: DirReference,
    files: Array<File>,
  ) => boolean | Promise<boolean>,
|};
type StateTypes = {|
  config: {|
    parentDir: DirReference,
  |} | null,
|};

class CreateFileDialog extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();

  state: StateTypes = {
    config: null,
  };

  show(parentDir: DirReference) {
    // eslint-disable-next-line no-throw-literal
    if (this.inputRef.current === null) throw 'ref is null';

    const inputElem = this.inputRef.current;

    this.setState(
      {
        config: { parentDir },
      },
      () => inputElem.click(),
    );
  }

  async confirm() {
    // eslint-disable-next-line no-throw-literal
    if (this.inputRef.current === null) throw 'ref is null';
    // eslint-disable-next-line no-throw-literal
    if (this.state.config === null) throw 'unreachable';

    const {
      config: { parentDir },
    } = this.state;

    await this.props.onUpload(parentDir, this.inputRef.current.files);
  }

  render() {
    return (
      <input
        ref={this.inputRef}
        type="file"
        onChange={() => this.confirm()}
        style={{ display: 'none' }}
        aria-hidden
      />
    );
  }
}

export default CreateFileDialog;
