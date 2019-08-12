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
      consoleText.splice(0, 1);
      // removes the first row (first value of the array)
    }
    document.getElementById('consoleInput').scrollIntoView(false);
  }

  onSubmit = e => {
    e.preventDefault();
    this.inputValue = this.inputRef.current.value;
    if (this.inputValue.startsWith('/')) {
      switch (this.inputValue) {
        case '/help':
        case '/h':
          this.consoleOut(`${this.inputValue}`, 'userInput');
          this.consoleOut('Help Page', 'stdOut');
          break;
        case '/clear':
        case '/c':
          consoleText = [];
          break;
        default:
          this.consoleOut(`${this.inputValue}`, 'userInput');
          this.consoleOut(`Command not found: ${this.inputValue}`, 'stdErr');
          break;
      }
    } else {
      this.consoleOut(`${this.inputValue}`, 'userInput');
    }
    this.forceUpdate();
    this.inputRef.current.value = '';
  };

  consoleOut = (text, info) => {
    switch (info) {
      case 'userInput':
        consoleText.push({ text: `>>>${text}`, color: 'green' });
        break;
      case 'stdOut':
        consoleText.push({ text: `${text}`, color: 'black' });
        break;
      case 'stdErr':
        consoleText.push({ text: `Error: ${text}`, color: 'red' });
        break;
      default:
        consoleText.push({ text: `${text}`, color: 'black' });
        break;
    }
  };

  render() {
    return (
      <div className={s.console} id="console">
        <div className={s.output}>
          {consoleText.map(({ text, color }) => (
            <div className={s.textOutput} textColor={color}>
              {text}
            </div>
          ))}
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
