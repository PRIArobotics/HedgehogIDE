import React from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from './console.css';

let consoleText = [];

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  componentDidUpdate() {
    document.getElementById('consoleInput').scrollIntoView(false);
  }

  onSubmit = e => {
    e.preventDefault();
    consoleText.push(`>>>${this.inputRef.current.value}`);
    this.forceUpdate();
    this.inputRef.current.value = '';
  };

  render() {
    return (
      <div className={s.console} id="console">
        {consoleText.map(text => (
          <div>{text}<br /></div>
        ))}
        <form onSubmit={this.onSubmit} id="consoleInput">
          &gt;&gt;&gt;
          <input
            type="text"
            name="name"
            className={s.console}
            ref={this.inputRef}
          />
        </form>
      </div>
    );
  }
}

export default withStyles(s)(Console);
