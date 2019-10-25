// @flow

import * as React from 'react';

import * as StateDB from '../../core/store/state';
import * as ProjectsDB from '../../core/store/projects';

type PropTypes = {||};
type StateTypes = {||};

export default class IndexedDB extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();

  componentDidMount() {
    (async () => {
      await StateDB.init();

      const value = await StateDB.getState('Input');
      if (this.inputRef.current !== null) this.inputRef.current.value = value;

      await ProjectsDB.init();

      /* eslint-disable no-console */
      console.log('empty', await ProjectsDB.getProjects());

      const p: ProjectsDB.Project = { name: 'foo' };
      console.log('new object', p);

      await ProjectsDB.createProject(p);
      console.log('created', p);

      console.log('created', await ProjectsDB.getProjects());

      try {
        await ProjectsDB.createProject(p);
      } catch (ex) {
        //
      }

      p.name = 'bar';
      await ProjectsDB.updateProject(p);
      console.log('updated', await ProjectsDB.getProjects());

      // eslint-disable-next-line no-throw-literal
      if (p.id === undefined) throw 'unreachable';
      console.log(await ProjectsDB.getProjectById(p.id));
      console.log(await ProjectsDB.getProjectByName('bar'));

      await ProjectsDB.removeProject(p);
      console.log('removed', await ProjectsDB.getProjects());
    })();
  }

  handleInput = () => {
    if (this.inputRef.current === null) return;

    StateDB.setState('Input', this.inputRef.current.value);
  };

  render() {
    return (
      <div>
        <h1>IndexedDB with JsStore</h1>
        <input type="text" ref={this.inputRef} onInput={this.handleInput} />
      </div>
    );
  }
}
