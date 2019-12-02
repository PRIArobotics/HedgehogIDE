// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Paper from '@material-ui/core/Paper';

import s from './WebRTC.scss';

type Message = {|
  type: 'IN' | 'OUT',
  text: string,
|};

const msg = (type: 'IN' | 'OUT', text: string): Message => ({ type, text });

type PropTypes = {||};
type StateTypes = {|
  left: Array<Message>,
  right: Array<Message>,
|};

class WebRTC extends React.Component<PropTypes, StateTypes> {
  state = {
    left: [],
    right: [],
  };

  componentDidMount() {
  }

  handleSend(from: string, to: string) {
    const text = 'msg';
    return e => {
      this.setState(oldState => ({
        [from]: [...oldState[from], msg('OUT', text)],
        [to]: [...oldState[to], msg('IN', text)],
      }));
    };
  }

  render() {
    const renderChat = (messages: Array<Message>, onSend) => (
      <Paper className={s.chat} square>
        {messages.map(({ type, text }, i) => (
          <div key={i} className={`${s.msg} ${type === 'OUT' ? s.mine : s.theirs}`}>{text}</div>
        ))}
        <button onClick={onSend}>Send</button>
      </Paper>
    );

    return (
      <div className={s.root}>
        <div className={s.container}>
          {renderChat(this.state.left, this.handleSend('left', 'right'))}
          {renderChat(this.state.right, this.handleSend('right', 'left'))}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(WebRTC);
