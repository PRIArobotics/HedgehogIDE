// @flow

import * as React from 'react';
import TaskExecutor, { type TaskExecutorType, type CommandHandler } from './TaskExecutor';
import { type Handler as SdkCommandHandler } from '../../../sdk/base';

import { mapObject } from '../../../util';

export type Task = {|
  name: string,
  code: string,
  api: {
    [command: string]: SdkCommandHandler<>,
  },
|};

type PropTypes = {||};
type StateTypes = {|
  tasks: Task[],
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
  taskExecutorRefs: Map<string, RefObject<typeof TaskExecutor>> = new Map();
  eventRegistry: Map<string, Set<TaskExecutorType>> = new Map();

  state = {
    tasks: [],
  };

  get tasks() {
    return this.state.tasks;
  }

  addTask(task: Task): Task {
    this.taskExecutorRefs.set(task.name, React.createRef());
    this.setState(state => ({
      tasks: [...state.tasks, task],
    }));
    return task;
  }

  removeTask(task: Task) {
    const taskExecutor = this.getTaskExecutor(task.name);
    if (taskExecutor === null) throw 'unreachable';

    this.setState(state => ({
      tasks: state.tasks.filter(t => t.name !== task.name),
    }));
    task.api.misc_exit({});
    this.taskExecutorRefs.delete(task.name);
    for (const listeners of this.eventRegistry.values()) {
      listeners.delete(taskExecutor);
    }
  }

  getTaskExecutor(taskName: string): TaskExecutorType | null {
    return this.taskExecutorRefs.get(taskName)?.current ?? null;
  }

  registerForEvents(event: string, taskExecutor: TaskExecutorType) {
    let listeners = this.eventRegistry.get(event);

    // create listeners array if necessary
    if (listeners === undefined) {
      listeners = new Set();
      this.eventRegistry.set(event, listeners);
    }

    listeners.add(taskExecutor);
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
        {tasks.map(task => {
          const taskExecutorRef = this.taskExecutorRefs.get(task.name);
          // eslint-disable-next-line no-throw-literal
          if (taskExecutorRef === undefined) throw 'unreachable';

          const handlers = mapObject(
            {
              ...task.api,
              eventRegister: ({ event }, taskExecutor) => {
                this.registerForEvents(event, taskExecutor);
              },
            },
            // for each handler, create a function that invokes it with the payload and taskExecutor
            (handler) => (payload) => {
              // eslint-disable-next-line no-throw-literal
              if (taskExecutorRef.current === null) throw 'unreachable';
              return handler(payload, taskExecutorRef.current);
            },
          );

          return (
            <TaskExecutor
              key={task.name}
              ref={this.taskExecutorRefs.get(task.name)}
              name={task.name}
              code={`return (async () => {${task.code}\n})();`}
              handlers={handlers}
            />
          );
        })}
      </>
    );
  }
}
export default Executor;
