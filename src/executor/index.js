// @flow

import Hedgehog from './Hedgehog';
import connection, { ORIGIN, type IdeMessage } from './connection';
import sdk from './sdk';
import eventHandler from './event';

// message listener & handlers
const handlers = {
  execute(source, code: string) {
    connection.setSource(source);

    (async () => {
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      try {
        await fn();
        await eventHandler.waitForEvents();
        sdk.misc.exit();
      } catch (error) {
        console.error(error);
        sdk.misc.exit(error.toString());
      }
    })();
  },
  reply(_source, value: any) {
    connection.handleReply(value);
  },
  errorReply(_source, error: any) {
    connection.handleErrorReply(error);
  },
  event(_source, { event, payload }: { event: string, payload: any }) {
    eventHandler.handleEvent(event, payload);
  },
};

window.addEventListener(
  'message',
  ({ data, origin, source }: MessageEvent) => {
    if (origin !== ORIGIN) return;

    const { command, payload } =
      // if the source is what we expected, we assume the data is valid
      // $FlowExpectError
      (data: IdeMessage);

    const handler = handlers[command];
    if (handler) {
      handler(source, payload);
    }
  },
  false,
);

// global APIs for the client function

global.sdk = sdk;

global.Hedgehog = Hedgehog;
global.hedgehog = new Hedgehog('hedgehog');

global.print = (text: string) => {
  sdk.misc.print(text);
};
global.commands = async (...cmds: Promise<any>[]) => {
  await Promise.all(cmds);
};
global.sleep = async (ms: number) => {
  await sdk.hedgehog.sleep(ms);
  // await new Promise(resolve => setTimeout(resolve, ms));
};
