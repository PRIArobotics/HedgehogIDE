// @flow

import connection from './connection';

type EventCallback = (payload: any, sender: string | null) => void | Promise<void>;

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

  emit(prefix: string, eventName: string, payload: any) {
    const event = `${prefix}_${eventName}`;
    connection.send('emit', { event, payload });
  }

  handleEvent(sender: string | null, event: string, payload: any) {
    const callbacks = this.handlers.get(event);
    if (callbacks === undefined) return;
    for (const cb of callbacks) {
      cb(payload, sender);
    }
  }

  /**
   * This async method either resolves immediately if there are no event listeners,
   * Or blocks indefinitely to wait for further events to be received.
   */
  async waitForEvents() {
    for (const callbacks of this.handlers.values()) {
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
