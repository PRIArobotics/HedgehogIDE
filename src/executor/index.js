// @flow

// TODO hardcoded domain name
const ORIGIN = __DEV__ ? 'http://localhost:3000' : 'https://ide.pria.at';

// eslint-disable-next-line no-underscore-dangle
let _source: window | null = null;
const resolvers: Array<{|
  resolve: any => void,
  reject: any => void,
|}> = [];

const sendMessage = (command: string, payload: any) => {
  // eslint-disable-next-line no-throw-literal
  if (_source === null) throw 'sendMessage before execute';

  _source.postMessage({ command, payload }, ORIGIN);
};

const getReply = () =>
  new Promise((resolve, reject) => {
    resolvers.push({ resolve, reject });
  });

// exported APIs for the client function
global.print = (text: string) => {
  sendMessage('print', text);
};
global.moveMotor = async (port: number, power: number) => {
  sendMessage('moveMotor', { port, power });
  await getReply();
};
global.getAnalog = async (port: number) => {
  sendMessage('getAnalog', { port });
  return /* await */ getReply();
};
global.getDigital = async (port: number) => {
  sendMessage('getDigital', { port });
  return /* await */ getReply();
};
global.sleep = async (ms: number) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

// message listener & handlers
const handlers = {
  execute(source, code: string) {
    // eslint-disable-next-line no-throw-literal
    if (_source !== null) throw '_source already initialized';

    _source = source;

    (async () => {
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      try {
        await fn();
        sendMessage('exit');
      } catch (error) {
        sendMessage('exit', error);
      }
    })();
  },
  reply(source, value: any) {
    const { resolve } = resolvers.shift();
    resolve(value);
  },
  errorReply(source, error: any) {
    const { reject } = resolvers.shift();
    reject(error);
  },
};

const receiveMessage = ({ data, origin, source }) => {
  if (origin !== ORIGIN) return;

  const { command, payload } = data;

  const handler = handlers[command];
  if (handler) {
    handler(source, payload);
  }
};

window.addEventListener('message', receiveMessage, false);
