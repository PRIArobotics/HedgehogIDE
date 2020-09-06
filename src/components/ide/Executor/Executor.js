// @flow

import * as React from 'react';
import TaskExecutor, { type CommandHandler } from './TaskExecutor';
import { type Handler as SdkCommandHandler } from '../../../sdk/base';

import { mapObject } from '../../../util';

export type Task = {|
  name: string,
  code: string,
  api: {
    [command: string]: SdkCommandHandler<>,
  },
|};

export class TaskHandle {
  name: string;
  // eslint-disable-next-line no-use-before-define
  executor: Executor;

  handlers: {
    [command: string]: CommandHandler,
  };
  frame: React.ElementRef<'iframe'> | null = null;

  // eslint-disable-next-line no-use-before-define
  constructor(executor: Executor, task: Task) {
    this.executor = executor;
    this.name = task.name;

    this.handlers = mapObject(
      {
        ...task.api,
        eventRegister: ({ event }, taskHandle) => {
          executor.registerForEvents(event, taskHandle);
        },
      },
      // for each handler, create a function that takes the payload and invokes the handler
      handler => payload => handler(payload, this),
    );
  }

  // arrow function because of binding
  setFrame = (frame: React.ElementRef<'iframe'> | null) => {
    this.frame = frame;
  };

  // public API
  sendMessage(sender: string | null, command: string, payload: any) {
    if (this.frame === null) return;
    this.frame.contentWindow.postMessage({ sender, command, payload }, '*');
  }

  sendExecute(code: string) {
    this.sendMessage(null, 'execute', code);
  }

  sendReply(value: any) {
    this.sendMessage(null, 'reply', value);
  }

  sendErrorReply(error: any) {
    this.sendMessage(null, 'errorReply', error);
  }

  sendEvent(event: string, payload: any) {
    this.sendMessage(null, 'event', { event, payload });
  }

  async withReply(cb: () => any | Promise<any>) {
    try {
      const value = await cb();
      this.sendReply(value);
    } catch (error) {
      console.error(error);
      this.sendErrorReply(error.toString());
    }
  }
}

type PropTypes = {||};
type StateTypes = {|
  tasks: {
    task: Task,
    taskHandle: TaskHandle,
  }[],
|};

/**
 * The executor manages tasks that are running in sandboxed iframes.
 * The most common kind of task is a user program,
 * others are plugins that can interact with those programs, the simulation environment, etc. via the SDK.
 *
 * The `Task` type exported here represents a workload to be run by the Executor.
 * The executor then creates a `TaskExecutor` that runs that workload.
 */
class Executor extends React.Component<PropTypes, StateTypes> {
  taskHandles: Map<string, TaskHandle> = new Map();
  eventRegistry: Map<string, Set<TaskHandle>> = new Map();

  state = {
    tasks: [],
  };

  addTask(task: Task): Task {
    const taskHandle = new TaskHandle(this, task);
    this.taskHandles.set(task.name, taskHandle);
    this.setState(state => ({
      tasks: [...state.tasks, { task, taskHandle }],
    }));
    return task;
  }

  removeTask(task: Task) {
    const taskHandle = this.getTaskHandle(task.name);
    // eslint-disable-next-line no-throw-literal
    if (taskHandle === null) throw 'unreachable';

    this.setState(state => ({
      tasks: state.tasks.filter(({ task: t }) => t.name !== task.name),
    }));
    task.api.misc_exit({});
    this.taskHandles.delete(task.name);
    for (const listeners of this.eventRegistry.values()) {
      listeners.delete(taskHandle);
    }
  }

  getTaskHandle(taskName: string): TaskHandle | null {
    return this.taskHandles.get(taskName) ?? null;
  }

  registerForEvents(event: string, taskHandle: TaskHandle) {
    let listeners = this.eventRegistry.get(event);

    // create listeners array if necessary
    if (listeners === undefined) {
      listeners = new Set();
      this.eventRegistry.set(event, listeners);
    }

    listeners.add(taskHandle);
  }

  sendEvent(event: string, payload: any) {
    const listeners = this.eventRegistry.get(event);
    if (listeners !== undefined) {
      for (const listener of listeners) {
        listener.sendEvent(event, payload);
      }
    }
  }

  render() {
    const { tasks } = this.state;

    return (
      <>
        {tasks.map(({ task, taskHandle }) => (
          <TaskExecutor
            key={task.name}
            ref={taskHandle.setFrame}
            code={`return (async () => {${task.code}\n})();`}
            handlers={taskHandle.handlers}
          />
        ))}
      </>
    );
  }
}
export default Executor;
