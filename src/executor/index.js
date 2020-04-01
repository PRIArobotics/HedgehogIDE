// @flow

import Hedgehog from './Hedgehog';
import connection, { ORIGIN } from './connection';
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
  reply(source, value: any) {
    connection.handleReply(value);
  },
  errorReply(source, error: any) {
    connection.handleErrorReply(error);
  },
  event(source, { event, payload }: { event: string, data: any }) {
    eventHandler.handleEvent(event, payload);
  },
};

window.addEventListener(
  'message',
  ({ data, origin, source }) => {
    if (origin !== ORIGIN) return;

    const { command, payload } = data;

    const handler = handlers[command];
    if (handler) {
      handler(source, payload);
    }
  },
  false,
);

// global APIs for the client function

global.connection = connection;
global.sdk = sdk;

global.Hedgehog = Hedgehog;
global.hedgehog = new Hedgehog('hedgehog', connection);

global.print = (text: string) => {
  sdk.misc.print(text);
};
global.commands = async (...cmds: Promise<any>[]) => {
  await Promise.all(cmds);
};
global.sleep = async (ms: number) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};
