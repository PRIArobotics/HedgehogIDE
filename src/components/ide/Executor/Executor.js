// @flow

import * as React from 'react';
import ExecutorTask from './ExecutorTask';

export type Task = {
  code: string,
  api: {
    [command: string]: (
      payload: any,
      // eslint-disable-next-line no-use-before-define
      executor: ExecutorTask,
      source: window,
    ) => void | Promise<void>,
  },
};

type PropTypes = {||};
type StateTypes = {|
  tasks: Task[],
|};

/**
 * The executor manages tasks that are running in sandboxed iframes.
 * The most common kind of task is a user program,
 * others are plugins that can interact with those programs, the simulation environment, etc. via the SDK.
 */
class Executor extends React.Component<PropTypes, StateTypes> {
  taskExecutorRefs: Map<Task, RefObject<typeof ExecutorTask>> = new Map();
  eventRegistry: Map<string, ExecutorTask[]> = new Map();

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
    this.setState(state => ({
      tasks: state.tasks.filter(currentTask => currentTask !== task),
    }));
    task.api.misc_exit({});
    this.taskExecutorRefs.delete(task);
    this.eventRegistry.forEach((tasks, event) => {
      this.eventRegistry.set(event, tasks.filter(t => t !== this));
    });
  }

  getTaskExecutorRef(task: Task): RefObject<typeof ExecutorTask> {
    return this.taskExecutorRefs.get(task);
  }

  registerForEvents(event, taskExecutor) {
    if (!this.eventRegistry.has(event)) {
      this.eventRegistry.set(event, [taskExecutor]);
    } else {
      const listeners = this.eventRegistry.get(event);
      if (!listeners.includes(this)) {
        listeners.push(this);
      }
    }
  }

  sendEvent(event: string, payload: any) {
    const tasks = this.eventRegistry.get(event);
    if (tasks) {
      tasks.forEach(task => task.sendEvent(event, payload));
    }
  }

  render() {
    const { tasks } = this.state;

    return (
      <>
        {tasks.map((task: Task, index) => (
          <ExecutorTask
            key={index}
            ref={this.taskExecutorRefs.get(task)}
            code={`return (async () => {${task.code}\n})();`}
            handlers={task.api}
            executor={this}
          />
        ))}
      </>
    );
  }
}
export default Executor;
