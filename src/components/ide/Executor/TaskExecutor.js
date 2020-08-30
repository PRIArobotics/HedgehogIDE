// @flow

import * as React from 'react';
import Executor from './Executor';

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
  executor: Executor,
  handlers: {
    [command: string]: (
      payload: any,
      // eslint-disable-next-line no-use-before-define
      executor: TaskExecutor,
    ) => void | Promise<void>,
  },
|};
type StateTypes = {|
  executorDoc: string | null,
|};

const fetchExecutorDoc = fetch('/executor').then(response => response.text());

/**
 * A TaskExecutor encapsulates a single hidden, sandboxed iframe containing the `/executor` document.
 * TaskExecutors are managed by an executor.
 *
 * The component sets up communication facilities for communication between the iframe and the IDE.
 */
class TaskExecutor extends React.Component<PropTypes, StateTypes> {
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
          this.sendExecute(this.props.code);
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
    if (origin !== 'null' || source !== this.frameRef.current.contentWindow) return;

    const { command, payload } = (data: ExecutorMessage);
    if (command === 'eventRegister') {
      this.props.executor.registerForEvents(payload.event, this);
    }

    const handler = this.props.handlers[command];
    if (handler) {
      handler(payload, this);
    }
  };

  sendMessage(command: string, payload: any) {
    if (this.frameRef.current === null) return;
    this.frameRef.current.contentWindow.postMessage({ command, payload }, '*');
  }

  sendExecute(code: string) {
    this.sendMessage('execute', code);
  }

  sendReply(value: any) {
    this.sendMessage('reply', value);
  }

  sendErrorReply(error: any) {
    this.sendMessage('errorReply', error);
  }

  sendEvent(event: string, payload: any) {
    this.sendMessage('event', { event, payload });
  }

  async withReply(cb: () => any | Promise<any>) {
    try {
      const value = await cb();
      this.sendReply(value);
    } catch (error) {
      console.error(error);
      this.sendErrorReply(error.toString());
    }
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

export default TaskExecutor;
