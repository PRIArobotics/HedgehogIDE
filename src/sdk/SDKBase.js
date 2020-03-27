// @flow

import ExecutorTask from '../components/ide/Executor/ExecutorTask';

export type Handler<T = void> = (
  args: any,
  executorTask: ExecutorTask,
) => T | Promise<T>;

class SDKBase {
  handlers: { [command: string]: Handler<> } = {};

  static withReply(handler: Handler<any>): Handler<> {
    return async (args: any, executorTask: ExecutorTask) => {
      await executorTask.withReply(handler.bind(null, args, executorTask));
    };
  }
}
export default SDKBase;
