// @flow

import ExecutorTask from '../components/ide/Executor/ExecutorTask';

type HandlerFunction = (args: any) => any | Promise<any>;
type Handler = (args: any, executorTask: ExecutorTask) => Promise<void>;

class SDKBase {
  handlers: { [command: string]: HandlerFunction } = {};

  static withReply(handler: HandlerFunction): Handler {
    return async (args: any, executorTask: ExecutorTask) => {
      await executorTask.withReply(handler.bind(null, args));
    };
  }
}
export default SDKBase;
