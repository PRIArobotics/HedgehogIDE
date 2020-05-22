// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import * as hooks from '../../misc/hooks';

// eslint-disable-next-line css-modules/no-unused-class
import s from './Console.scss';

type ConsoleItem = {|
  key: number,
  text: string,
  stream: string,
|};

type ConsoleState = {|
  nextKey: number,
  items: ConsoleItem[],
|};

export type ConsoleAction =
  | {| type: 'PRINT', text: string, stream: string |}
  | {| type: 'CLEAR' |};

function consoleReducer(
  state: ConsoleState,
  action: ConsoleAction,
): ConsoleState {
  switch (action.type) {
    case 'PRINT': {
      const key = state.nextKey;
      const { text, stream } = action;
      const newItem = { key, text, stream };

      const nextKey = state.nextKey + 1;
      const items = [...state.items.slice(-99), newItem];

      return { nextKey, items };
    }
    case 'CLEAR': {
      return { nextKey: 0, items: [] };
    }
    default:
      // eslint-disable-next-line no-throw-literal
      throw 'unreachable';
  }
}

type Props = {||};
type Instance = {|
  print(text: string, stream: string): void,
  clear(): void,
|};

function Console(props: Props, ref: Ref<Instance>) {
  const [{ items }, dispatch] = React.useReducer(consoleReducer, {
    nextKey: 0,
    items: [],
  });
  const inputRef = hooks.useElementRef<'input'>();
  const bottomRef = hooks.useElementRef<'div'>();

  React.useEffect(() => {
    if (bottomRef.current !== null) bottomRef.current.scrollIntoView(false);
  }, [items, bottomRef]);

  function print(text: string, stream: string) {
    dispatch({ type: 'PRINT', text, stream });
  }

  function clear() {
    dispatch({ type: 'CLEAR' });
  }

  function handleSubmit(e) {
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
          clear();
          break;

        default:
          print(`Command not found: ${input}`, 'stderr');
      }
    }
  }

  React.useImperativeHandle(ref, () => ({ print, clear }));

  useStyles(s);
  return (
    <div style={{ overflowX: 'auto', height: '100%' }}>
      <div className={s.root}>
        <div className={s.outputPane}>
          {items.map(({ key, text, stream }) => (
            <pre key={key} className={`${s.output} ${s[stream]}`}>
              {text}
            </pre>
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
