// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// eslint-disable-next-line css-modules/no-unused-class
import s from './Console.scss';

type ConsoleItem = {|
  text: string,
  stream: string,
|};

type PropTypes = {|
  // eslint-disable-next-line no-use-before-define
  forwardedRef: RefObject<typeof Console>,
|};
type StateTypes = {|
  consoleText: ConsoleItem[],
|};

class Console extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();
  bottomRef: RefObject<'div'> = React.createRef();

  state = {
    consoleText: [],
  };

  componentDidMount() {
    this.props.forwardedRef.current = this;
    if (this.bottomRef.current !== null)
      this.bottomRef.current.scrollIntoView(false);
  }

  componentDidUpdate() {
    if (this.bottomRef.current !== null)
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
    if (this.inputRef.current === null) return;
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
