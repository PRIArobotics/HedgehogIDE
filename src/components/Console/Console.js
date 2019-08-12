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

  componentDidMount() {
    document.getElementById('consoleInput').scrollIntoView(false);
  }

  componentDidUpdate() {
    if (consoleText.length > 100) {
      // maximum number of rows is set at 100
      consoleText.splice(0, 1); // removes the first row (first value of the array)
      this.componentDidUpdate(); // checks if it is still too long
    }
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
        <div className={s.output}>
        {consoleText.map(text => (
          <div>{text}<br /></div>
        ))}
        </div>
        <div className={s.fixed} style={{ borderWidth: '3px', borderStyle: 'solid' }} >
          <form onSubmit={this.onSubmit}>
            <div style={{ width: '3em', border: '1px' }}>
              &gt;&gt;&gt;
            </div>
            <div id="consoleInput">
              <input
                type="text"
                name="name"
                className={s.console}
                ref={this.inputRef}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Console);
