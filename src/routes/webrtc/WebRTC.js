// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Paper from '@material-ui/core/Paper';

import s from './WebRTC.scss';

type Message = {|
  type: 'IN' | 'OUT',
  text: string,
|};

type Chat = {|
  messages: Array<Message>,
  connection: RTCPeerConnection,
  channel: RTCDataChannel,
|};

const msg = (type: 'IN' | 'OUT', text: string): Message => ({ type, text });

type PropTypes = {||};
type StateTypes = {|
  left: Chat | null,
  right: Chat | null,
|};

class WebRTC extends React.Component<PropTypes, StateTypes> {
  state = {
    left: null,
    right: null,
  };

  async createConnections() {
    const leftConnection = new RTCPeerConnection(null);
    const rightConnection = new RTCPeerConnection(null);
    leftConnection.onicecandidate = async ({ candidate }) => {
      await rightConnection.addIceCandidate(candidate);
      // eslint-disable-next-line no-console
      console.log('left ICE candidate added to right');
    };
    rightConnection.onicecandidate = async ({ candidate }) => {
      await leftConnection.addIceCandidate(candidate);
      // eslint-disable-next-line no-console
      console.log('right ICE candidate added to left');
    };

    // eslint-disable-next-line no-console
    console.log('left & right created');

    const leftChannel = leftConnection.createDataChannel('chat');
    // eslint-disable-next-line no-console
    console.log('channel created @ left');

    const offer = await leftConnection.createOffer();
    leftConnection.setLocalDescription(offer);
    rightConnection.setRemoteDescription(offer);
    // eslint-disable-next-line no-console
    console.log('left offered right');
    const answer = await rightConnection.createAnswer();
    // eslint-disable-next-line no-console
    console.log('right answered left');
    rightConnection.setLocalDescription(answer);
    leftConnection.setRemoteDescription(answer);

    const rightChannel = await new Promise(resolve => {
      rightConnection.ondatachannel = ({ channel }) => resolve(channel);
    });
    // eslint-disable-next-line no-console
    console.log('channel connected @ right');

    leftChannel.onmessage = ({ data }) => this.handleRecv('left', data);
    rightChannel.onmessage = ({ data }) => this.handleRecv('right', data);

    this.setState({
      left: {
        messages: [],
        connection: leftConnection,
        channel: leftChannel,
      },
      right: {
        messages: [],
        connection: rightConnection,
        channel: rightChannel,
      },
    });
  }

  componentDidMount() {
    this.createConnections();
  }

  handleRecv(to: string, text: string) {
    this.setState(oldState => {
      const chat = oldState[to];
      return {
        [to]: {
          ...chat,
          messages: [...chat.messages, msg('IN', text)],
        },
      };
    });
  }

  handleSend(from: string, text: string) {
    return () => {
      this.state[from].channel.send(text);
      this.setState(oldState => {
        const chat = oldState[from];
        return {
          [from]: {
            ...chat,
            messages: [...chat.messages, msg('OUT', text)],
          },
        };
      });
    };
  }

  render() {
    const renderChat = (chat: Chat, onSend) => (
      <Paper className={s.chat} square>
        {chat.messages.map(({ type, text }) => (
          <div className={`${s.msg} ${type === 'OUT' ? s.mine : s.theirs}`}>
            {text}
          </div>
        ))}
        <button type="button" onClick={onSend}>
          Send
        </button>
      </Paper>
    );

    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.state.left === null
            ? null
            : renderChat(this.state.left, this.handleSend('left', 'Hello'))}
          {this.state.right === null
            ? null
            : renderChat(this.state.right, this.handleSend('right', 'There'))}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(WebRTC);
