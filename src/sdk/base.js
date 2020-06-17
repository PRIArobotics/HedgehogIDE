// @flow

import ExecutorTask from '../components/ide/Executor/ExecutorTask';
import Executor from '../components/ide/Executor';

export type Handler<T = void> = (args: any, executorTask: ExecutorTask) => T | Promise<T>;

export default function emit(prefix: string, executor: Executor, event: string, payload: any) {
  executor.sendEvent(`${prefix}_${event}`, payload);
}
