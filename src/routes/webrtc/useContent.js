// @flow

import * as React from 'react';

import type { AceChangeEvent } from './aceTypes';
import { type RemoteCursorsAction } from './useRemoteCursors';

import Controller from './conclave/controller';

type ContentHook = {|
  value: string,
  refreshValue(): void,
  onChange(value: string, event: AceChangeEvent): void,
|};

export default function useContent(
  remoteCursorsDispatch: RemoteCursorsAction => void,
  controller: Controller,
): ContentHook {
  const [value, setValue] = React.useState<string>('');

  function refreshValue() {
    setValue(controller.crdt.toText());
  }

  return {
    value,
    refreshValue,
    onChange(_value: string, { action, lines, start, end }: AceChangeEvent) {
      switch (action) {
        case 'insert': {
          remoteCursorsDispatch({ type: 'INSERT', start, end });
          controller.localInsert(lines, { line: start.row, ch: start.column });
          refreshValue();
          break;
        }
        case 'remove': {
          remoteCursorsDispatch({ type: 'DELETE', start, end });
          controller.localDelete(
            { line: start.row, ch: start.column },
            { line: end.row, ch: end.column },
          );
          refreshValue();
          break;
        }
        default:
          // eslint-disable-next-line no-throw-literal
          throw 'unreachable';
      }
    },
  };
}
