// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Paper from '@material-ui/core/Paper';

import Peer, { DataConnection } from 'peerjs';

import s from './WebRTC.scss';

// TODO for now, use the central 0.peerjs.com server during development
const peerOptions = __DEV__ ? {} : { host: '/', path: '/peerjs' };

type Message = {|
  type: 'IN' | 'OUT',
  text: string,
|};

function msg(type: 'IN' | 'OUT', text: string): Message {
  return { type, text };
}

type ChatProps = {|
  connection: DataConnection | null,
  sendText: string,
|};

function Chat({
  connection,
  sendText,
}: ChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);

  function handleSend() {
    if (connection === null) return;

    setMessages(oldMessages => [...oldMessages, msg('OUT', sendText)]);
    connection.send(sendText);
  }

  React.useEffect(() => {
    if (connection === null) return undefined;

    function handleRecv(text) {
      setMessages(oldMessages => [...oldMessages, msg('IN', text)]);
    }

    connection.on('data', handleRecv);

    return () => {
      connection.off('data', handleRecv);
    }
  }, [connection]);

  return (
    <Paper className={s.chat} square>
      {messages.map(({ type, text }) => (
        <div className={`${s.msg} ${type === 'OUT' ? s.mine : s.theirs}`}>{text}</div>
      ))}
      <div>
        <button type="button" onClick={handleSend}>
          Send
        </button>
        Connected: {connection !== null ? 'yes' : 'no'}
      </div>
    </Paper>
  );
}

type Props = {||};

function WebRTC(_props: Props) {
  const [left, setLeft] = React.useState<DataConnection | null>(null);
  const [right, setRight] = React.useState<DataConnection | null>(null);

  React.useEffect(() => {
    (async () => {
      const leftPeer = new Peer(peerOptions);
      const rightPeer = new Peer(peerOptions);
      console.log('peers created');
      leftPeer.on('error', err => console.log(err));
      rightPeer.on('error', err => console.log(err));

      const leftId = await new Promise(resolve => leftPeer.on('open', resolve));
      console.log(leftId);
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('trying to connect...');
      const rightConn = rightPeer.connect(leftId);
      const leftConn = await new Promise(resolve => leftPeer.on('connection', resolve));
      console.log('peers connected');

      setLeft(leftConn);
      setRight(rightConn);
    })();
  }, []);

  return (
    <div className={s.root}>
      <div className={s.container}>
        <Chat connection={left} sendText="Hello" />
        <Chat connection={right} sendText="There" />
      </div>
    </div>
  );
}

export default withStyles(s)(WebRTC);
