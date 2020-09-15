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
  // eslint-disable-next-line no-use-before-define
  executor: Executor;
  task: Task;

  handlers: {
    [command: string]: CommandHandler,
  };
  frame: React.ElementRef<'iframe'> | null = null;

  // eslint-disable-next-line no-use-before-define
  constructor(executor: Executor, task: Task) {
    this.executor = executor;
    this.task = task;

    this.handlers = {
      ...mapObject(
        task.api,
        // for each handler, create a function that takes the payload and invokes the handler
        handler => payload => handler(payload, this),
      ),
      // built-in handlers
      subscribe: this.subscribe,
      call: this.call,
      emit: this.emit,
      reply: this.reply,
      errorReply: this.errorReply,
    };
  }

  // handlers to be passed into components. arrow functions because of binding

  // used as the component ref for TaskExecutor, which has the instance type iframe
  setFrame = (frame: React.ElementRef<'iframe'> | null) => {
    this.frame = frame;
  };

  // message handlers

  subscribe = ({ event }) => {
    this.executor.registerForEvents(event, this.onEvent);
  };

  call = ({ receiver, command, payload }) => {
    const receiverHandle = this.executor.getTaskHandle(receiver);
    // TODO without knowing whether the call expects a return value there is no way to report the error properly
    if (receiverHandle === null) {
      console.error(
        `unknown receiving task '${receiver}' for call ${command}() with payload`,
        payload,
      );
      return;
    }

    receiverHandle.sendCall(this.task.name, command, payload);
  };

  emit = ({ event, payload }) => {
    this.executor.sendEvent(this.task.name, event, payload);
  };

  reply = ({ receiver, value }) => {
    const receiverHandle = this.executor.getTaskHandle(receiver);
    // even less chance to report back the error for a reply. log to console
    if (receiverHandle === null) {
      console.error(`unknown receiving task '${receiver}' for reply with value`, value);
      return;
    }

    receiverHandle.sendReply(this.task.name, value);
  };

  errorReply = ({ receiver, error }) => {
    const receiverHandle = this.executor.getTaskHandle(receiver);
    // even less chance to report back the error for a reply. log to console
    if (receiverHandle === null) {
      console.error(`unknown receiving task '${receiver}' for reply with error`, error);
      return;
    }

    receiverHandle.sendErrorReply(this.task.name, error);
  };

  // event handler
  onEvent = (sender: string | null, event: string, payload: any) => {
    this.sendEvent(sender, event, payload);
  };

  // public API

  sendMessage(sender: string | null, command: string, payload: any) {
    if (this.frame === null) return;
    this.frame.contentWindow.postMessage({ sender, command, payload }, '*');
  }

  sendCall(sender: string | null, command: string, payload: any) {
    this.sendMessage(sender, 'call', { command, payload });
  }

  sendEvent(sender: string | null, event: string, payload: any) {
    this.sendMessage(sender, 'event', { event, payload });
  }

  sendReply(sender: string | null, value: any) {
    this.sendMessage(sender, 'reply', value);
  }

  sendErrorReply(sender: string | null, error: any) {
    this.sendMessage(sender, 'errorReply', error);
  }

  async withReply(sender: string | null, cb: () => any | Promise<any>) {
    try {
      const value = await cb();
      this.sendReply(sender, value);
    } catch (error) {
      console.error(sender, error);
      this.sendErrorReply(error.toString());
    }
  }
}

type EventListener = (sender: string | null, event: string, payload: any) => void | Promise<void>;

type PropTypes = {||};
type StateTypes = {|
  taskHandleList: TaskHandle[],
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
  eventRegistry: Map<string, Set<EventListener>> = new Map();

  state = {
    taskHandleList: [],
  };

  addTask(task: Task): Task {
    const taskHandle = new TaskHandle(this, task);
    this.taskHandles.set(task.name, taskHandle);
    this.setState(state => ({
      taskHandleList: [...state.taskHandleList, taskHandle],
    }));
    return task;
  }

  removeTask(taskName: string) {
    const taskHandle = this.getTaskHandle(taskName);
    if (taskHandle === null) return;

    this.setState(state => ({
      taskHandleList: state.taskHandleList.filter(t => t !== taskHandle),
    }));
    this.taskHandles.delete(taskName);
    for (const listeners of this.eventRegistry.values()) {
      listeners.delete(taskHandle.onEvent);
    }
  }

  getTaskHandle(taskName: string): TaskHandle | null {
    return this.taskHandles.get(taskName) ?? null;
  }

  registerForEvents(event: string, listener: EventListener) {
    let listeners = this.eventRegistry.get(event);

    // create listeners array if necessary
    if (listeners === undefined) {
      listeners = new Set();
      this.eventRegistry.set(event, listeners);
    }

    listeners.add(listener);
  }

  sendEvent(sender: string | null, event: string, payload: any) {
    const listeners = this.eventRegistry.get(event);
    if (listeners === undefined) return;
    for (const listener of listeners) {
      listener(sender, event, payload);
    }
  }

  render() {
    const { taskHandleList } = this.state;

    return (
      <>
        {taskHandleList.map(taskHandle => (
          <TaskExecutor
            key={taskHandle.task.name}
            ref={taskHandle.setFrame}
            code={`return (async () => {${taskHandle.task.code}\n})();`}
            handlers={taskHandle.handlers}
          />
        ))}
      </>
    );
  }
}
export default Executor;
