// @flow

import React from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from './console.css';

type PropTypes = {||};
type StateTypes = {|
  consoleText: Array<String>,
|};

class Console extends React.Component<PropTypes, StateTypes> {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      consoleText: [],
    }
  }

  componentDidMount() {
    document.getElementById('consoleInput').scrollIntoView(false);
  }

  componentDidUpdate() {
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
          this.consoleOut('1st Line\n2nd Line', 'stdOut');
          break;
        case '/clear':
        case '/c':
          this.setState({
            consoleText: [],
          });
          break;
        default:
          this.consoleOut(`${this.inputValue}`, 'userInput');
          this.consoleOut(`Command not found: ${this.inputValue}`, 'stdErr');
          break;
      }
    } else {
      this.consoleOut(`${this.inputValue}`, 'userInput');
    }
    this.inputRef.current.value = '';
  };

  consoleOut = (text, info) => {
    let item;

    switch (info) {
      case 'userInput':
        item = { text: `>>>${text}`, color: 'green' };
        break;
      case 'stdOut':
        item = { text: `${text}`, color: 'black' };
        break;
      case 'stdErr':
        item = { text: `[Error] ${text}`, color: 'red' };
        break;
      default:
        item = { text: `${text}`, color: 'black' };
        break;
    }

    this.setState(oldState => {
      const oldText = oldState.consoleText;

      return {
        consoleText: [...oldText.slice(-99), item],
      };
    });
  };

  render() {
    return (
      <div className={s.console} id="console">
        <div className={s.output}>
          {this.state.consoleText.map(({ text, color }) => (
            <pre className={s.textOutput} textColor={color}>
              {text}
            </pre>
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
