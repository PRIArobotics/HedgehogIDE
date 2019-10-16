// @flow

// TODO hardcoded domain name
const ORIGIN = __DEV__ ? 'http://localhost:3000' : 'https://ide.pria.at';

// eslint-disable-next-line no-underscore-dangle
let _source = null;

const sendMessage = (command, payload) => {
  _source.postMessage({ command, payload }, ORIGIN);
};

// exported APIs for the client function
global.print = text => sendMessage('print', text);
global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// message listener & handlers
const handlers = {
  execute(source, code) {
    // TODO assert _source === null
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
