// @flow

import * as React from 'react';

import * as AsyncReact from '../../misc/AsyncReact';

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

  async show(parentDir: DirReference) {
    await AsyncReact.setState(this, {
      config: { parentDir },
    });

    // eslint-disable-next-line no-throw-literal
    if (this.inputRef.current === null) throw 'ref is null';

    this.inputRef.current.click();
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
