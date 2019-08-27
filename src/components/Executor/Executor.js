/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import React from 'react';

type PropTypes = {|
  code: string,
  handlers: { [command: string]: (any, any) => void },
|};
type StateTypes = {||};

class Executor extends React.Component<PropTypes, StateTypes> {
  frameRef: React.RefObject = React.createRef();

  state = {};

  componentDidMount() {
    this.frameRef.current.onload = () => {
      this.sendMessage('execute', this.props.code);
    };
    window.addEventListener('message', this.receiveMessage, false);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage);
  }

  receiveMessage = ({ data, origin, source }) => {
    if (origin !== 'null' || source !== this.frameRef.current.contentWindow)
      return;

    const { command, payload } = data;

    const handler = this.props.handlers[command];
    if (handler) {
      handler(source, payload);
    }
  };

  sendMessage(command: string, payload: any) {
    this.frameRef.current.contentWindow.postMessage({ command, payload }, '*');
  }

  render() {
    return (
      // eslint-disable-next-line jsx-a11y/iframe-has-title
      <iframe
        ref={this.frameRef}
        sandbox="allow-scripts"
        src="/assets/executor.html"
        style={{ display: 'none' }}
      />
    );
  }
}

export default Executor;
