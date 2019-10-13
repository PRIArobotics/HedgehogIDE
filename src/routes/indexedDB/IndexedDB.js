// @flow

import React from 'react';
import StateDB from '../../core/jsstore/state';

export default class IndexedDB extends React.Component {
  inputRef: React.RefObject = React.createRef();
  state = { html: '' };

  componentDidMount() {
    (async () => {
      await StateDB.init();
      this.inputRef.current.value = await StateDB.getState('Input');
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
