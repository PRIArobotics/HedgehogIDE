// @flow

import ExecutorTask from '../components/ide/Executor/ExecutorTask';

type HandlerFunction = (args: any) => any | Promise<any>;
type Handler = (args: any, executorTask: ExecutorTask) => Promise<void>;

class SDKBase {
  handlers: { [command: string]: HandlerFunction } = {};

  static handlerFor(handler: HandlerFunction): Handler {
    return async (args: any, executorTask: ExecutorTask) => {
      executorTask.withReply(handler.bind(null, args));
    };
  }

  getHandlers(): { [command: string]: Handler } {
    const handlers = Object.fromEntries(
      Object.entries(this.handlers).map(([command, handlerMixed]) => {
        // $FlowExpectError
        const handler: HandlerFunction = handlerMixed;
        return [command, SDKBase.handlerFor(handler)];
      }),
    );
    return handlers;
  }
}
export default SDKBase;
