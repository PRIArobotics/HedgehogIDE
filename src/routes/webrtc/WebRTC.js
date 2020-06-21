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
  channel: RTCDataChannel | null,
  sendText: string,
|};

function Chat({
  channel,
  sendText,
}: ChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);

  function handleSend() {
    if (channel === null) return;

    setMessages(oldMessages => [...oldMessages, msg('OUT', sendText)]);
    channel.send(sendText);
  }

  React.useEffect(() => {
    if (channel === null) return undefined;

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
      <div>
        <button type="button" onClick={handleSend}>
          Send
        </button>
        Connected: {channel !== null ? 'yes' : 'no'}
      </div>
    </Paper>
  );
}

type Props = {||};

function WebRTC(_props: Props) {
  const [left, setLeft] = React.useState<RTCDataChannel | null>(null);
  const [right, setRight] = React.useState<RTCDataChannel | null>(null);

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

      setLeft(leftChannel);
      setRight(rightChannel);
    })();
  }, []);

  return (
    <div className={s.root}>
      <div className={s.container}>
        <Chat channel={left} sendText="Hello" />
        <Chat channel={right} sendText="There" />
      </div>
    </div>
  );
}

export default withStyles(s)(WebRTC);
