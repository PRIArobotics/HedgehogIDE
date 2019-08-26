const handlers = {
  execute(source, code) {
    const sendMessage = (command, payload) => {
      source.postMessage({ command, payload }, '*');
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
  // TODO hardcoded domain name
  if (origin !== 'http://localhost:3000') return;

  const { command, payload } = data;

  const handler = handlers[command];
  if (handler) {
    handler(source, payload);
  }
};

window.addEventListener('message', receiveMessage, false);
