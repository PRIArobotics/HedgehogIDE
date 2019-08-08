import React from 'react';

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
    console.log(this.inputRef.current.value);
    consoleText += `${this.inputRef.current.value}<br />`;
    this.inputRef.current.value = '';
    this.setState(this.state);
  };

  render() {
    return (
      <div className={s.console}>
        Hallo! <br />
        {consoleText}
        <form onSubmit={this.onSubmit}>
          User&gt; <input type="text" name="name" className={s.console} ref={this.inputRef} />
        </form>
      </div>
    );
  }
}

export default withStyles(s)(Console);
