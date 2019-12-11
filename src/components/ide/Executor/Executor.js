// @flow

import * as React from 'react';

type ReceiveMessageEvent = {
  data: any,
  origin: string,
  source: window,
};

type ExecutorMessage = {
  command: string,
  payload: any,
};

type PropTypes = {|
  code: string,
  handlers: { [command: string]: (window, any) => any },
|};
type StateTypes = {|
  executorDoc: string | null,
|};

const fetchExecutorDoc = fetch('/executor').then(response => response.text());

class Executor extends React.Component<PropTypes, StateTypes> {
  frameRef: RefObject<'iframe'> = React.createRef();

  state = {
    executorDoc: null,
  };

  componentDidMount() {
    fetchExecutorDoc.then(executorDoc => {
      this.setState({ executorDoc }, () => {
        if (this.frameRef.current === null) {
          // eslint-disable-next-line no-throw-literal
          throw 'ref is null in componentDidMount';
        }

        this.frameRef.current.onload = () => {
          this.sendMessage('execute', this.props.code);
        };
        window.addEventListener('message', this.receiveMessage, false);
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage);
  }

  receiveMessage = ({ data, origin, source }: ReceiveMessageEvent) => {
    if (this.frameRef.current === null) return;
    if (origin !== 'null' || source !== this.frameRef.current.contentWindow)
      return;

    const { command, payload } = (data: ExecutorMessage);

    const handler = this.props.handlers[command];
    if (handler) {
      handler(source, payload);
    }
  };

  sendMessage(command: string, payload: any) {
    if (this.frameRef.current === null) return;
    this.frameRef.current.contentWindow.postMessage({ command, payload }, '*');
  }

  render() {
    const { executorDoc } = this.state;

    return (
      // eslint-disable-next-line jsx-a11y/iframe-has-title
      <iframe
        ref={this.frameRef}
        sandbox="allow-scripts"
        // src="/executor"
        srcDoc={executorDoc}
        style={{ display: 'none' }}
      />
    );
  }
}

export default Executor;
