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
type Instance = React.ElementRef<'iframe'>;

const fetchExecutorDoc = fetch('/executor').then((response) => response.text());

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
    // uses useCallback because otherwise each render resets the ref.
    // (the ref could be registered with a new callback, so the callback needs to be stable)
    const attachFrame = React.useCallback(
      (f) => {
        // set the ref for this component
        if (typeof ref === 'function') ref(f);
        // eslint-disable-next-line no-param-reassign
        else ref.current = f;
        // set the frame state variable
        setFrame(f);
      },
      [ref],
    );

    // register message listener
    React.useEffect(() => {
      if (frame === null) return;

      function receiveMessage({ data, origin, source }: MessageEvent) {
        if (origin !== 'null' || source !== frame.contentWindow) return undefined;

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
        const command = 'init';
        const payload = code;
        frame.contentWindow.postMessage({ sender, command, payload }, '*');
      };
    }, [frame]);

    // only render the iframe after loading the executorDoc
    if (executorDoc === null) return null;

    return (
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

export default TaskExecutor;
