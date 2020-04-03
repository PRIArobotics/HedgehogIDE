// @flow

import ExecutorTask from '../components/ide/Executor/ExecutorTask';
import Executor from '../components/ide/Executor';

export type Handler<T = void> = (
  args: any,
  executorTask: ExecutorTask,
) => T | Promise<T>;

export function emit(
  prefix: string,
  task: ExecutorTask,
  event: string,
  payload: any,
) {
  task.sendEvent(`${prefix}_${event}`, payload);
}

export function emitToAll(
  prefix: string,
  executor: Executor,
  event: string,
  payload: any,
) {
  executor.tasks.forEach(task => {
    const { current } = executor.getTaskExecutorRef(task);
    // eslint-disable-next-line no-throw-literal
    if (current === null) throw 'ref is null';
    emit(prefix, current, event, payload);
  });
}
