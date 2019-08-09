import React from 'react';
import ReactDOM from 'react-dom';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './console.css';
import Ide from '../Ide';

let consoleText = [];

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  onSubmit = e => {
    e.preventDefault();
    consoleText.push(`>>>${this.inputRef.current.value}`);
    this.forceUpdate();
    document.getElementById('scro').scrollIntoView();
    this.inputRef.current.value = '';
  };

  render() {
    return (
      <div className={s.console} id="console">
        {consoleText.map(text => (
          <div>{text}<br /></div>
        ))}
        <form onSubmit={this.onSubmit}>
          &gt;&gt;&gt;
          <input
            type="text"
            name="name"
            className={s.console}
            ref={this.inputRef}
          />
        </form>
        <br id="scro" />
      </div>
    );
  }
}

export default withStyles(s)(Console);
