// @flow

import connection from './connection';

class EventHandler {
  handlers: {
    [name: string]: ((payload: any) => void | Promise<void>)[],
  } = {};

  on(prefix: string, event: string, cb: (payload: any) => void) {
    const eventName = `${prefix}_${event}`;
    this.handlers[eventName] = [...(this.handlers[eventName] || []), cb];
    connection.send('eventRegister', { event: eventName });
  }

  handleEvent(event: string, payload: any) {
    if (!this.handlers[event]) {
      return;
    }
    this.handlers[event].forEach(cb => {
      cb(payload);
    });
  }

  async waitForEvents() {
    const handlerCount = Object.entries(this.handlers).reduce(
      (count, [event, handlers]) => {
        if (handlers) {
          return count + handlers.length;
        } else {
          return count;
        }
      },
      0,
    );
    if (handlerCount > 0) {
      return new Promise(() => {});
    }
    return Promise.resolve();
  }
}

const eventHandler = new EventHandler();
export default eventHandler;
