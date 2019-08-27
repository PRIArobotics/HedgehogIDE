// TODO hardcoded domain name
const ORIGIN = 'http://localhost:3000';

const handlers = {
  execute(source, code) {
    const sendMessage = (command, payload) => {
      source.postMessage({ command, payload }, ORIGIN);
    };

    try {
      // eslint-disable-next-line no-eval
      eval(code);
    } finally {
      sendMessage('exit');
    }
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
