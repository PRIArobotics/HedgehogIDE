// @flow

import Executor from '../components/ide/Executor';

class SDKBase {
  handlers = {};

  static handlerFor(handler) {
    return async (args, executor: Executor) => {
      executor.withReply(handler.bind(null, args));
    };
  }

  getHandlers() {
    const handlers = Object.fromEntries(
      Object.entries(this.handlers)
        .map(([name, handler]) => [name, SDKBase.handlerFor(handler)]),
    );
    return handlers;
  }
}
export default SDKBase;
