// @flow

import * as React from 'react';
import TaskExecutor, { type Task } from './TaskExecutor';

export type { Task };

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
  eventRegistry: Map<string, Set<TaskExecutor>> = new Map();

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

  getTaskExecutor(taskName: string): TaskExecutor | null {
    return this.taskExecutorRefs.get(taskName)?.current ?? null;
  }

  registerForEvents(event: string, taskExecutor: TaskExecutor) {
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
        {tasks.map(task => (
          <TaskExecutor
            key={task.name}
            ref={this.taskExecutorRefs.get(task.name)}
            code={`return (async () => {${task.code}\n})();`}
            handlers={{
              ...task.api,
              eventRegister: ({ event }, taskExecutor, _source) => {
                this.registerForEvents(event, taskExecutor);
              },
            }}
          />
        ))}
      </>
    );
  }
}
export default Executor;
