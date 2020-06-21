// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Paper from '@material-ui/core/Paper';

import s from './WebRTC.scss';

type Message = {|
  type: 'IN' | 'OUT',
  text: string,
|};

function msg(type: 'IN' | 'OUT', text: string): Message {
  return { type, text };
}

type ChatProps = {|
  channel: RTCDataChannel,
  sendText: string,
|};

function Chat({
  channel,
  sendText,
}: ChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);

  function handleSend() {
    setMessages(oldMessages => [...oldMessages, msg('OUT', sendText)]);
    channel.send(sendText);
  }

  React.useEffect(() => {
    channel.onmessage = ({ data: text }) => {
      setMessages(oldMessages => [...oldMessages, msg('IN', text)]);
    };

    return () => {
      channel.onmessage = undefined;
    }
  }, [channel]);

  return (
    <Paper className={s.chat} square>
      {messages.map(({ type, text }) => (
        <div className={`${s.msg} ${type === 'OUT' ? s.mine : s.theirs}`}>{text}</div>
      ))}
      <button type="button" onClick={handleSend}>
        Send
      </button>
    </Paper>
  );
}

type Props = {||};

function WebRTC(_props: Props) {
  const [left, setLeft] = React.useState<ChatProps | null>(null);
  const [right, setRight] = React.useState<ChatProps | null>(null);

  React.useEffect(() => {
    (async () => {
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

      setLeft({
        channel: leftChannel,
        sendText: 'Hello',
      });

      setRight({
        channel: rightChannel,
        sendText: 'There',
      });
    })();
  }, []);

  return (
    <div className={s.root}>
      <div className={s.container}>
        {left === null ? null : <Chat {...left} />}
        {right === null ? null : <Chat {...right} />}
      </div>
    </div>
  );
}

export default withStyles(s)(WebRTC);
