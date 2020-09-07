// @flow

import Executor, { TaskHandle } from '../components/ide/Executor';

export type Handler<T = void> = (args: any, taskHandle: TaskHandle) => T | Promise<T>;

export default function emit(prefix: string, executor: Executor, event: string, payload: any) {
  executor.sendEvent(null, `${prefix}_${event}`, payload);
}
