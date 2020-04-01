// @flow

import * as React from 'react';
import { RefObject } from 'react';
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
class Executor extends React.Component<PropTypes, StateTypes> {
  taskExecutorRefs: Map<Task, RefObject<typeof ExecutorTask>> = new Map();
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
    this.taskExecutorRefs.delete(task);
  }

  getTaskExecutorRef(task: Task): RefObject<typeof ExecutorTask> {
    return this.taskExecutorRefs.get(task);
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
          />
        ))}
      </>
    );
  }
}
export default Executor;
