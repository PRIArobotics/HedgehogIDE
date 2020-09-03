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
  taskExecutorRefs: Map<Task, RefObject<typeof TaskExecutor>> = new Map();
  eventRegistry: Map<string, Set<TaskExecutor>> = new Map();

  state = {
    tasks: [],
  };

  get tasks() {
    return this.state.tasks;
  }

  addTask(task: Task) {
    this.taskExecutorRefs.set(task, React.createRef());
    this.setState(state => ({
      tasks: [...state.tasks, task],
    }));
    return task;
  }

  removeTask(task: Task) {
    const taskExecutor = this.getTaskExecutor(task);
    if (taskExecutor === null) throw 'unreachable';

    this.setState(state => ({
      tasks: state.tasks.filter(t => t !== task),
    }));
    task.api.misc_exit({});
    this.taskExecutorRefs.delete(task);
    for (const listeners of this.eventRegistry.values()) {
      listeners.delete(taskExecutor);
    }
  }

  getTaskExecutor(task: Task): TaskExecutor | null {
    return this.taskExecutorRefs.get(task)?.current ?? null;
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
        {tasks.map((task: Task, index) => (
          <TaskExecutor
            key={index}
            ref={this.taskExecutorRefs.get(task)}
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
