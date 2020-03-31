// @flow

import Hedgehog, { type Connection } from './Hedgehog';
import * as misc from './sdk/misc';
import * as hedgehog from './sdk/hedgehog';

// TODO hardcoded domain name
const ORIGIN = __DEV__ ? 'http://localhost:3000' : 'https://ide.pria.at';

class Conn implements Connection {
  source: window | null = null;
  resolvers: Array<{|
    resolve: any => void,
    reject: any => void,
  |}> = [];

  setSource(source: window) {
    // eslint-disable-next-line no-throw-literal
    if (this.source !== null) throw 'source already initialized';

    this.source = source;
  }

  send(command: string, payload: any) {
    // eslint-disable-next-line no-throw-literal
    if (this.source === null) throw 'send without source';

    this.source.postMessage({ command, payload }, ORIGIN);
  }

  recv(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resolvers.push({ resolve, reject });
    });
  }

  handleReply(value: any) {
    const { resolve } = this.resolvers.shift();
    resolve(value);
  }

  handleErrorReply(error: any) {
    const { reject } = this.resolvers.shift();
    reject(error);
  }
}

const connection = new Conn();

// message listener & handlers
const handlers = {
  execute(source, code: string) {
    connection.setSource(source);

    (async () => {
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      try {
        await fn();
        sdk.misc.exit('exit');
      } catch (error) {
        console.error(error);
        sdk.misc.exit('exit', error.toString());
      }
    })();
  },
  reply(source, value: any) {
    connection.handleReply(value);
  },
  errorReply(source, error: any) {
    connection.handleErrorReply(error);
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
global.sdk = {
  misc,
  hedgehog,
};

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
