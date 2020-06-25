// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import Paper from '@material-ui/core/Paper';

import Peer, { DataConnection } from 'peerjs';

import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-github';

import ConclaveController from './conclave/controller';
import ConclaveBroadcast from './conclave/broadcast';
import ConclaveEditor, { type AcePosition, type AceChangeEvent } from './conclave/editor';

import s from './WebRTC.scss';

const peerOptions = __DEV__
  ? {
      host: 'localhost',
      port: 3010,
      path: '/peerjs',
    }
  : {
      host: '/',
      path: '/peerjs',
    };

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

function Chat({ connection, sendText }: ChatProps) {
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
    };
  }, [connection]);

  return (
    <Paper className={s.chat} square>
      {messages.map(({ type, text }, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={`${s.msg} ${type === 'OUT' ? s.mine : s.theirs}`}>
          {text}
        </div>
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

type EditorProps = {|
  controller: ConclaveController | null,
|};

function Editor({ controller }: EditorProps) {
  const [content, setContent] = React.useState<string | null>(null);
  const [listeners, setListeners] = React.useState<any>(null);

  React.useEffect(() => {
    if (controller === null) return;

    const { editor } = controller;

    setContent(controller.crdt.toText());

    setListeners({
      // onLoad
      onChange(_value: string, event: AceChangeEvent) {
        // eslint-disable-next-line no-console
        console.log(event);
        editor.onChange(event);

        const text = controller.crdt.toText();
        // eslint-disable-next-line no-console
        console.log(text);
        setContent(text);
      },
      onSelectionChange(selection, _event) {
        const ranges = selection.getAllRanges();
        // eslint-disable-next-line no-console
        console.log(ranges.map(rangeToString).join(', '));
      },
      onCursorChange(selection, _event) {
        const cursor = selection.getCursor();
        // eslint-disable-next-line no-console
        console.log(positionToString(cursor));
      },
      // onValidate
    });
  }, [controller]);

  function positionToString({ row, column }) {
    return `${row}:${column}`;
  }

  function rangeToString({ start, end }) {
    return `(${positionToString(start)}, ${positionToString(end)})`;
  }

  return (
    <Paper className={s.editor} square>
      {content !== null && (
        <div className={s['editor-wrapper']}>
          <AceEditor
            mode="javascript"
            theme="github"
            name="editor"
            width="100%"
            height="100%"
            fontSize={16}
            {...listeners}
            markers={[
              {
                startRow: 0,
                startCol: 1,
                endRow: 0,
                endCol: 3,
                className: s['remote-selection'],
                type: 'text',
              },
              {
                startRow: 0,
                startCol: 3,
                endRow: 0,
                endCol: 4,
                className: s['remote-cursor'],
                type: 'text',
              },
            ]}
            value={content}
            showGutter
            highlightActiveLine
            autoScrollEditorIntoView
            style={{
              position: 'absolute',
            }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              // enableSnippets: enableSnippets,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </div>
      )}
    </Paper>
  );
}

type Props = {||};

function WebRTC(_props: Props) {
  const [left, setLeft] = React.useState<DataConnection | null>(null);
  const [right, setRight] = React.useState<DataConnection | null>(null);

  React.useEffect(() => {
    (async () => {
      // eslint-disable-next-line no-console
      console.log('options:', peerOptions);
      const leftPeer = new Peer(peerOptions);
      const rightPeer = new Peer(peerOptions);
      // eslint-disable-next-line no-console
      console.log('peers created');
      // eslint-disable-next-line no-console
      leftPeer.on('error', err => console.log(err));
      // eslint-disable-next-line no-console
      rightPeer.on('error', err => console.log(err));

      const leftId = await new Promise(resolve => leftPeer.on('open', resolve));
      const rightId = await new Promise(resolve => rightPeer.on('open', resolve));
      // eslint-disable-next-line no-console
      console.log(leftId, rightId);
      const rightConn = rightPeer.connect(leftId);
      const leftConn = await new Promise(resolve => leftPeer.on('connection', resolve));
      // eslint-disable-next-line no-console
      console.log('peers connected');

      setLeft(leftConn);
      setRight(rightConn);
    })();
  }, []);

  const [leftController, setLeftController] = React.useState<DataConnection | null>(null);
  const [rightController, setRightController] = React.useState<DataConnection | null>(null);

  React.useEffect(() => {
    function createController(siteId: string, targetPeerId: string | null) {
      return new ConclaveController(
        siteId,
        targetPeerId,
        location.origin,
        new Peer(peerOptions),
        new ConclaveBroadcast(),
        new ConclaveEditor(),
      );
    }

    setLeftController(createController('left', null));
    setLeftController(createController('right', 'left'));
  }, []);

  useStyles(s);

  return (
    <div className={s.root}>
      <div className={s.container}>
        <Chat connection={left} sendText="Hello" />
        <Chat connection={right} sendText="There" />
      </div>
      <div className={s.container}>
        <Editor controller={leftController} />
        <Editor controller={rightController} />
      </div>
    </div>
  );
}

export default WebRTC;
