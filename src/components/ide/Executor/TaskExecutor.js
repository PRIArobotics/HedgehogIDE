// @flow

import * as React from 'react';

import * as hooks from '../../misc/hooks';

type ExecutorMessage = {
  command: string,
  payload: any,
};

export type CommandHandler = (payload: any) => void | Promise<void>;

type Props = {|
  code: string,
  handlers: {
    [command: string]: CommandHandler,
  },
|};
type Instance = {|
  sendEvent(event: string, payload: any): void,
  sendReply(value: any): void,
  sendErrorReply(error: any): void,
  withReply(cb: () => any | Promise<any>): Promise<void>,
|};

const fetchExecutorDoc = fetch('/executor').then(response => response.text());

/**
 * A TaskExecutor encapsulates a single hidden, sandboxed iframe containing the `/executor` document.
 * TaskExecutors are managed by an executor.
 *
 * The component sets up communication facilities for communication between the iframe and the IDE.
 */
const TaskExecutor = React.forwardRef<Props, Instance>(
  ({ code, handlers }: Props, ref: Ref<Instance>) => {
    // load the executorDoc in the beginning
    const [executorDoc, setExecutorDoc] = React.useState<string | null>(null);
    React.useEffect(() => {
      fetchExecutorDoc.then(setExecutorDoc);
    }, []);

    // the frame, stored for local use
    const [frame, setFrame] = React.useState<React.ElementRef<'iframe'> | null>(null);

    // register message listener
    React.useEffect(() => {
      if (frame === null) return;

      function receiveMessage({ data, origin, source }: MessageEvent) {
        if (origin !== 'null' || source !== frame.contentWindow) return;

        const { command, payload } =
          // if the source is what we expected, we assume the data is valid
          // $FlowExpectError
          (data: ExecutorMessage);

        handlers[command]?.(payload);
      }

      window.addEventListener('message', receiveMessage, false);
      return () => {
        window.removeEventListener('message', receiveMessage);
      };
    }, [frame, handlers]);

    // send execute command to iframe
    React.useEffect(() => {
      if (frame === null) return;

      frame.onload = () => {
        const sender = null;
        const command = 'execute';
        const payload = code;
        frame.contentWindow.postMessage({ sender, command, payload }, '*');
      };
    }, [frame]);

    // imperative API
    function sendMessage(sender: string | null, command: string, payload: any) {
      if (frame === null) return;
      frame.contentWindow.postMessage({ sender, command, payload }, '*');
    }

    function sendEvent(event: string, payload: any) {
      sendMessage(null, 'event', { event, payload });
    }

    function sendReply(value: any) {
      sendMessage(null, 'reply', value);
    }

    function sendErrorReply(error: any) {
      sendMessage(null, 'errorReply', error);
    }

    async function withReply(cb: () => any | Promise<any>) {
      try {
        const value = await cb();
        sendReply(value);
      } catch (error) {
        console.error(error);
        sendErrorReply(error.toString());
      }
    }

    React.useImperativeHandle(
      ref,
      () => ({
        sendEvent,
        sendReply,
        sendErrorReply,
        withReply,
      }),
      [frame],
    );

    // only render the iframe after loading the executorDoc
    if (executorDoc === null) return null;

    return (
      // eslint-disable-next-line jsx-a11y/iframe-has-title
      <iframe
        ref={setFrame}
        sandbox="allow-scripts"
        // src="/executor"
        srcDoc={executorDoc}
        style={{ display: 'none' }}
      />
    );
  },
);

export type TaskExecutorType = React.ElementRef<typeof TaskExecutor>;
export default TaskExecutor;
