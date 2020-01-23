// @flow

import * as React from 'react';

import type { DirReference } from '.';

type PropTypes = {||};
type StateTypes = {|
  config: {|
    name: string,
    objectURL: string,
  |} | null,
|};

class CreateFileDialog extends React.Component<PropTypes, StateTypes> {
  linkRef: RefObject<'a'> = React.createRef();

  state: StateTypes = {
    config: null,
  };

  show(name: string, content: string) {
    if (this.state.config !== null) {
      URL.revokeObjectURL(this.state.config.objectURL);
    }

    const objectURL = URL.createObjectURL(new Blob([content]));

    this.setState(
      {
        config: { name, objectURL },
      },
      () => {
        // eslint-disable-next-line no-throw-literal
        if (this.linkRef.current === null) throw 'ref is null';

        this.linkRef.current.click();
      },
    );
  }

  render() {
    if (this.state.config === null) return null;

    const {
      config: { name, objectURL },
    } = this.state;

    return <a ref={this.linkRef} href={objectURL} download={name} />;
  }
}

export default CreateFileDialog;
