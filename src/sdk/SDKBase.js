// @flow

import ExecutorTask from '../components/ide/Executor/ExecutorTask';

export type Handler<T = void> = (
  args: any,
  executorTask: ExecutorTask,
) => T | Promise<T>;
