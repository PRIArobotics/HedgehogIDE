// @flow

import { type TaskExecutorType } from '../components/ide/Executor/TaskExecutor';
import Executor from '../components/ide/Executor';

export type Handler<T = void> = (args: any, taskExecutor: TaskExecutorType) => T | Promise<T>;

export default function emit(prefix: string, executor: Executor, event: string, payload: any) {
  executor.sendEvent(`${prefix}_${event}`, payload);
}
