// @flow

import connection from './connection';

type EventCallback = (payload: any) => void | Promise<void>;

class EventHandler {
  handlers: Map<string, Set<EventCallback>> = new Map();

  on(prefix: string, eventName: string, cb: EventCallback) {
    const event = `${prefix}_${eventName}`;

    let callbacks = this.handlers.get(event);

    // create callbacks array & register with the IDE if necessary
    if (callbacks === undefined) {
      callbacks = new Set();
      this.handlers.set(event, callbacks);
      connection.send('subscribe', { event });
    }

    callbacks.add(cb);
  }

  handleEvent(event: string, payload: any) {
    let callbacks = this.handlers.get(event);
    if (callbacks === undefined) return;
    for (let cb of callbacks) {
      cb(payload);
    }
  }

  /**
   * This async method either resolves immediately if there are no event listeners,
   * Or blocks indefinitely to wait for further events to be received.
   */
  async waitForEvents() {
    for (let callbacks of this.handlers.values()) {
      if (callbacks.size > 0) {
        // never resolve
        return new Promise(() => {});
      }
    }
    // resolve immediately
    return Promise.resolve();
  }
}

const eventHandler = new EventHandler();
export default eventHandler;
