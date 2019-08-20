// @flow

import React from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from './console.scss';

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
    };
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
          this.consoleOut(`${this.inputValue}`, 'stdin');
          this.consoleOut('1st Line\n2nd Line', 'stdout');
          break;
        case '/clear':
        case '/c':
          this.setState({
            consoleText: [],
          });
          break;
        default:
          this.consoleOut(`${this.inputValue}`, 'stdin');
          this.consoleOut(`Command not found: ${this.inputValue}`, 'stderr');
          break;
      }
    } else {
      this.consoleOut(`${this.inputValue}`, 'stdin');
    }
    this.inputRef.current.value = '';
  };

  consoleOut = (text, stream) => {
    this.setState(oldState => ({
      consoleText: [...oldState.consoleText.slice(-99), { text, stream }],
    }));
  };

  render() {
    return (
      <div className={s.console} id="console">
        <div className={s.output}>
          {this.state.consoleText.map(({ text, stream }) => (
            <pre className={`${s.textOutput} ${s[stream]}`}>{text}</pre>
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
