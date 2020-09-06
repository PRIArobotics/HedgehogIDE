// @flow

import * as React from 'react';

import { type Handler as SdkCommandHandler } from '../../../sdk/base';

type ExecutorMessage = {
  command: string,
  payload: any,
};

export type CommandHandler = (
  payload: any,
  // eslint-disable-next-line no-use-before-define
  executor: TaskExecutor,
) => void | Promise<void>;

export type Task = {|
  name: string,
  code: string,
  api: {
    [command: string]: SdkCommandHandler<>,
  },
|};

type PropTypes = {|
  name: string,
  code: string,
  handlers: {
    [command: string]: CommandHandler,
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

  receiveMessage = ({ data, origin, source }: MessageEvent) => {
    if (this.frameRef.current === null) return;
    if (origin !== 'null' || source !== this.frameRef.current.contentWindow) return;

    const { command, payload } =
      // if the source is what we expected, we assume the data is valid
      // $FlowExpectError
      (data: ExecutorMessage);

    this.props.handlers[command]?.(payload, this);
  };

  sendMessage(sender: string | null, command: string, payload: any) {
    if (this.frameRef.current === null) return;
    this.frameRef.current.contentWindow.postMessage({ sender, command, payload }, '*');
  }

  sendExecute(code: string) {
    this.sendMessage(null, 'execute', code);
  }

  sendReply(value: any) {
    this.sendMessage(null, 'reply', value);
  }

  sendErrorReply(error: any) {
    this.sendMessage(null, 'errorReply', error);
  }

  sendEvent(event: string, payload: any) {
    this.sendMessage(null, 'event', { event, payload });
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
