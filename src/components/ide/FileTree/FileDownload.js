// @flow

import * as React from 'react';

import * as AsyncReact from '../../misc/AsyncReact';

type PropTypes = {||};
type StateTypes = {|
  config: {|
    name: string,
    objectURL: string,
  |} | null,
|};

class FileDownload extends React.Component<PropTypes, StateTypes> {
  linkRef: RefObject<'a'> = React.createRef();

  state: StateTypes = {
    config: null,
  };

  async show(name: string, content: string) {
    if (this.state.config !== null) {
      URL.revokeObjectURL(this.state.config.objectURL);
    }

    const objectURL = URL.createObjectURL(new Blob([content]));

    await AsyncReact.setState(this, {
      config: { name, objectURL },
    });

    // eslint-disable-next-line no-throw-literal
    if (this.linkRef.current === null) throw 'ref is null';

    this.linkRef.current.click();
  }

  render() {
    if (this.state.config === null) return null;

    const {
      config: { name, objectURL },
    } = this.state;

    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a
        ref={this.linkRef}
        href={objectURL}
        download={name}
        style={{ display: 'none' }}
        aria-hidden
      />
    );
  }
}

export default FileDownload;
