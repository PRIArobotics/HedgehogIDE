// @flow

import * as React from 'react';
import ExecutorTask from './ExecutorTask';

type Task = {
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

type StateTypes = {|
  tasks: [Task],
|};
class Executor extends React.Component<{}, StateTypes> {
  state = {
    tasks: [],
  };

  addTask(task: Task) {
    this.setState(state => ({
      tasks: [...state.tasks, task],
    }));
    return task;
  }

  removeTask(task: Task) {
    this.setState(state => ({
      tasks: state.tasks.filter(currentTask => currentTask !== task),
    }));
  }

  render() {
    return this.state.tasks.map((task: Task, index) => (
      <ExecutorTask
        key={index}
        code={`return (async () => {${task.code}})();`}
        handlers={task.api}
      />
    ));
  }
}
export default Executor;
