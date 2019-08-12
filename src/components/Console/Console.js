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
    while (consoleText.length > 100) {
      // maximum number of rows is set at 100
      consoleText.splice(0, 1); // removes the first row (first value of the array)
    }
    document.getElementById('consoleInput').scrollIntoView(false);
  }

  onSubmit = e => {
    e.preventDefault();
    this.inputValue = this.inputRef.current.value
    if (this.inputValue.startsWith('/')) {
      switch (this.inputValue) {
        case '/help':
        case '/h':
          consoleText.push(`>>>${this.inputValue}`);
          consoleText.push('Help Page');
          break;
        case '/clear':
        case '/c':
          consoleText = [];
          break;
        default:
          consoleText.push(`>>>${this.inputValue}`);
          consoleText.push(`Command not found: ${this.inputValue}`);
          break;
      }
    } else {
      consoleText.push(`>>>${this.inputValue}`);
    }
    this.forceUpdate();
    this.inputRef.current.value = '';
  };

  render() {
    return (
      <div className={s.console} id="console">
        <div className={s.output}>
          {consoleText.map(text => {
            if (text.startsWith('>>>')) {
              return (<div style={{ wordWrap: 'break-word', color: 'green' }}>{text}</div>)
            } else {
              return (<div style={{ wordWrap: 'break-word' }}>{text}</div>)
            }
          })}
        </div>
        <div className={s.fixed}>
          <form onSubmit={this.onSubmit} style={{ display: 'flex' }}>
            &gt;&gt;&gt;
            <div id="consoleInput" className={s.consoleInput}>
              <input type="text" ref={this.inputRef} />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Console);
