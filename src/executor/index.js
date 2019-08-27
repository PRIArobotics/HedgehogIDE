// TODO hardcoded domain name
const ORIGIN = 'http://localhost:3000';

const handlers = {
  execute(source, code) {
    const context = {
      sendMessage(command, payload) {
        source.postMessage({ command, payload }, ORIGIN);
      },
    };

    (async () => {
      // eslint-disable-next-line no-new-func
      const fn = new Function('context', code);
      try {
        await fn(context);
      } finally {
        context.sendMessage('exit');
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
