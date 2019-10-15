// @flow

import React from 'react';
import * as StateDB from '../../core/store/state';
import * as ProjectsDB from '../../core/store/projects';

export default class IndexedDB extends React.Component {
  inputRef: React.RefObject = React.createRef();
  state = { html: '' };

  componentDidMount() {
    (async () => {
      await StateDB.init();
      this.inputRef.current.value = await StateDB.getState('Input');

      await ProjectsDB.init();

      console.log('empty', await ProjectsDB.getProjects());

      let p: ProjectsDB.Project = { name: 'foo' };
      console.log('new object', p);

      await ProjectsDB.createProject(p);
      console.log('created', p);

      console.log('created', await ProjectsDB.getProjects());

      try {
        await ProjectsDB.createProject(p);
      } catch(ex) {}

      p.name = 'bar';
      await ProjectsDB.updateProject(p);
      console.log('updated', await ProjectsDB.getProjects());

      console.log(await ProjectsDB.getProjectById(p.id));
      console.log(await ProjectsDB.getProjectByName('bar'));

      await ProjectsDB.removeProject(p);
      console.log('removed', await ProjectsDB.getProjects());
    })();
  }

  handleInput = () => StateDB.setState('Input', this.inputRef.current.value);

  render() {
    return (
      <div>
        <h1>IndexedDB with JsStore</h1>
        <div>{this.state.html}</div>
        <input type="text" ref={this.inputRef} onInput={this.handleInput} />
      </div>
    );
  }
}
