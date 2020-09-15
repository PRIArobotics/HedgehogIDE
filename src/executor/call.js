// @flow

import connection from './connection';

type CallCallback = (payload: any, sender: string | null) => void | Promise<void>;
type ReplyCallback = (payload: any, sender: string | null) => any | Promise<any>;

class CallHandler {
  handlers: Map<string, CallCallback> = new Map();

  registerCall(command: string, cb: CallCallback) {
    if (this.handlers.has(command)) throw new Error('Command already registered');
    this.handlers.set(command, cb);
  }

  registerCallWithReply(command: string, cb: ReplyCallback) {
    if (this.handlers.has(command)) throw new Error('Command already registered');
    this.handlers.set(command, async (payload, sender) => {
      try {
        const value = await cb(payload, sender);
        connection.send('reply', { receiver: sender, value });
      } catch (error) {
        console.error(sender, error);
        connection.send('errorReply', { receiver: sender, error });
      }
    });
  }

  call(receiver: string, command: string, payload: any) {
    connection.send('call', { receiver, command, payload });
  }

  async callWithReply(receiver: string, command: string, payload: any) {
    this.call(receiver, command, payload);
    return connection.recv();
  }

  handleCall(sender: string | null, command: string, payload: any) {
    const callback = this.handlers.get(command);
    if (callback === undefined) {
      // TODO without knowing whether the call expects a return value there is no way to report the error properly
      console.error(`unknown received call ${command}() with payload`, payload);
      return;
    }
    callback(payload, sender);
  }
}

const callHandler = new CallHandler();
export default callHandler;
