import React from 'react';
import ReactDOM from 'react-dom';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './console.css';

let consoleText = '';

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  onSubmit = e => {
    e.preventDefault();
    consoleText = this.inputRef.current.value;
    document
      .getElementById('consoleText')
      .appendChild(document.createTextNode(consoleText));
    document
      .getElementById('consoleText')
      .appendChild(document.createElement('Br'));
    this.inputRef.current.value = '';
  };

  render() {
    return (
      <div className={s.console}>
        Hallo! <br />
        <span id="consoleText" />
        <form onSubmit={this.onSubmit}>
          User&gt; <input type="text" name="name" className={s.console} ref={this.inputRef} />
        </form>
      </div>
    );
  }
}

export default withStyles(s)(Console);
