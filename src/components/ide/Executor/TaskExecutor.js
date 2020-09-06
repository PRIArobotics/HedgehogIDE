// @flow

import * as React from 'react';

import * as hooks from '../../misc/hooks';

import { type Handler as SdkCommandHandler } from '../../../sdk/base';

type ExecutorMessage = {
  command: string,
  payload: any,
};

export type CommandHandler = (
  payload: any,
  taskName: string,
) => void | Promise<void>;

export type Task = {|
  name: string,
  code: string,
  api: {
    [command: string]: SdkCommandHandler<>,
  },
|};

type Props = {|
  name: string,
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
  ({ name, code, handlers }: Props, ref: Ref<Instance>) => {
    // load the executorDoc in the beginning
    const [executorDoc, setExecutorDoc] = React.useState<string | null>(null);
    React.useEffect(() => {
      fetchExecutorDoc.then(setExecutorDoc);
    }, []);

    // the frame ref, and a state variable signifying when it was set
    const frameRef = hooks.useElementRef<'iframe'>();
    const [loaded, setLoaded] = React.useState<boolean>(false);
    // uses useCallback because otherwise each render resets the ref.
    // (the ref could be registered with a new callback,
    // so the callback needs to be stable)
    const attachFrame = React.useCallback(
      frame => {
        frameRef.current = frame;
        setLoaded(true);
      },
      [frameRef],
    );

    // register message listener
    React.useEffect(() => {
      function receiveMessage({ data, origin, source }: MessageEvent) {
        if (frameRef.current === null) return;
        if (origin !== 'null' || source !== frameRef.current.contentWindow) return;

        const { command, payload } =
          // if the source is what we expected, we assume the data is valid
          // $FlowExpectError
          (data: ExecutorMessage);

        handlers[command]?.(payload, name);
      }

      window.addEventListener('message', receiveMessage, false);
      return () => {
        window.removeEventListener('message', receiveMessage);
      };
    }, [frameRef, name, handlers]);

    // send execute command to iframe
    React.useEffect(() => {
      if (!loaded) return;
      if (frameRef.current === null) throw 'ref is null';

      const frame = frameRef.current;

      frame.onload = () => {
        const sender = null;
        const command = 'execute';
        const payload = code;
        frame.contentWindow.postMessage({ sender, command, payload }, '*');
      };
    }, [frameRef, loaded]);

    //imperative API
    function sendMessage(sender: string | null, command: string, payload: any) {
      if (frameRef.current === null) return;
      frameRef.current.contentWindow.postMessage({ sender, command, payload }, '*');
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

    React.useImperativeHandle(ref, () => ({
      sendEvent,
      sendReply,
      sendErrorReply,
      withReply,
    }), [frameRef]);

    // only render the iframe after loading the executorDoc
    if (executorDoc === null) return null;

    return(
      // eslint-disable-next-line jsx-a11y/iframe-has-title
      <iframe
        ref={attachFrame}
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
