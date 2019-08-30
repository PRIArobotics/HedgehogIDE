// @flow

import React from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from './Console.scss';

type ConsoleItem = {|
  text: string,
  stream: string,
|};

type PropTypes = {|
  forwardedRef: React.RefObject,
|};
type StateTypes = {|
  consoleText: Array<ConsoleItem>,
|};

class Console extends React.Component<PropTypes, StateTypes> {
  inputRef: React.RefObject = React.createRef();

  bottomRef: React.RefObject = React.createRef();

  state = {
    consoleText: [],
  };

  componentDidMount() {
    this.props.forwardedRef.current = this;
    this.bottomRef.current.scrollIntoView(false);
  }

  componentDidUpdate() {
    this.bottomRef.current.scrollIntoView(false);
  }

  componentWillUnmount() {
    this.props.forwardedRef.current = null;
  }

  consoleOut(text: string, stream: string) {
    this.setState(oldState => ({
      consoleText: [...oldState.consoleText.slice(-99), { text, stream }],
    }));
  }

  handleSubmit = e => {
    e.preventDefault();
    const input = this.inputRef.current.value;
    this.inputRef.current.value = '';

    this.consoleOut(`${input}`, 'stdin');
    if (input.startsWith('/')) {
      switch (input) {
        case '/help':
        case '/h':
          this.consoleOut('1st Line\n2nd Line', 'stdout');
          break;

        case '/clear':
        case '/c':
          this.setState({
            consoleText: [],
          });
          break;

        default:
          this.consoleOut(`Command not found: ${input}`, 'stderr');
          break;
      }
    }
  };

  render() {
    return (
      <div style={{ overflowX: 'auto', height: '100%' }}>
        <div className={s.root}>
          <div className={s.outputPane}>
            {this.state.consoleText.map(({ text, stream }) => (
              <pre className={`${s.output} ${s[stream]}`}>{text}</pre>
            ))}
            <div ref={this.bottomRef} />
          </div>
          <form className={s.inputForm} onSubmit={this.handleSubmit}>
            &gt;&gt;&gt;&nbsp;
            <input type="text" ref={this.inputRef} />
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Console);
