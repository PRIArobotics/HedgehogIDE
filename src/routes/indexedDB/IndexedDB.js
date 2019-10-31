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

      const pCreate: ProjectsDB.CreateProject = { name: 'foo', files: {} };
      console.log('new object', pCreate);

      const p: ProjectsDB.Project = await ProjectsDB.createProject(pCreate);
      console.log('created', p);

      console.log('created', await ProjectsDB.getProjects());

      try {
        await ProjectsDB.createProject({ ...p });
      } catch (ex) {
        //
      }

      await ProjectsDB.updateProject(p, { name: 'bar' });
      console.log('updated', await ProjectsDB.getProjects());

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
