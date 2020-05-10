// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

// eslint-disable-next-line css-modules/no-unused-class
import s from './Console.scss';

type ConsoleItem = {|
  text: string,
  stream: string,
|};

type Props = {||};
type Instance = {|
  consoleOut: (text: string, stream: string) => void,
|};

function Console(props: Props, ref: Ref<Instance>) {
  const [items, setItems] = React.useState<ConsoleItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (bottomRef.current !== null) bottomRef.current.scrollIntoView(false);
  }, [items, bottomRef]);

  const print = (text: string, stream: string) => {
    setItems([...items.slice(-99), { text, stream }]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (inputRef.current === null) return;
    const input = inputRef.current.value;
    inputRef.current.value = '';

    print(`${input}`, 'stdin');
    if (input.startsWith('/')) {
      switch (input) {
        case '/help':
        case '/h':
          print('1st Line\n2nd Line', 'stdout');
          break;

        case '/clear':
        case '/c':
          setItems([]);
          break;

        default:
          print(`Command not found: ${input}`, 'stderr');
          break;
      }
    }
  };

  React.useImperativeHandle(ref, () => ({
    consoleOut: print,
  }));

  useStyles(s);
  return (
    <div style={{ overflowX: 'auto', height: '100%' }}>
      <div className={s.root}>
        <div className={s.outputPane}>
          {items.map(({ text, stream }) => (
            <pre className={`${s.output} ${s[stream]}`}>{text}</pre>
          ))}
          <div ref={bottomRef} />
        </div>
        <form className={s.inputForm} onSubmit={handleSubmit}>
          &gt;&gt;&gt;&nbsp;
          <input type="text" ref={inputRef} />
        </form>
      </div>
    </div>
  );
}

export default React.forwardRef<Props, Instance>(Console);
