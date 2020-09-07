// @flow

import Hedgehog from './Hedgehog';
import connection, { ORIGIN, type IdeMessage } from './connection';
import sdk from './sdk';
import eventHandler from './event';

type IdeEvent = {
  event: string,
  payload: any,
};

type HandlerMap = {
  [command: string]: (payload: any, sender: string | null, source: WindowProxy) => void,
};

// message listener & handlers
const handlers: HandlerMap = {
  init(code: string, _sender, source: WindowProxy) {
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
  reply(value: any) {
    connection.handleReply(value);
  },
  errorReply(error: any) {
    connection.handleErrorReply(error);
  },
  event({ event, payload }: IdeEvent) {
    eventHandler.handleEvent(event, payload);
  },
};

function receiveMessage({ data, origin, source }: MessageEvent) {
  if (origin !== ORIGIN) return;

  const { sender, command, payload } =
    // if the source is what we expected, we assume the data is valid
    // $FlowExpectError
    (data: IdeMessage);

  handlers[command]?.(payload, sender, source);
}

window.addEventListener('message', receiveMessage, false);

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
