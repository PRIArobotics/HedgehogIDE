// @flow

import * as React from 'react';

import * as StateDB from '../../core/store/state';

type PropTypes = {||};
type StateTypes = {||};

export default class IndexedDB extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();

  componentDidMount() {
    (async () => {
      await StateDB.init();

      const value = await StateDB.getState('Input');
      if (this.inputRef.current !== null) this.inputRef.current.value = value;
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
