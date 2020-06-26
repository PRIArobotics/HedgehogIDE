// @flow

import * as React from 'react';

import type { AcePosition, AceChangeEvent } from './aceTypes';
import { type RemoteCursorsAction } from './useRemoteCursors';

import Controller from './conclave/controller';

type ContentHook = {|
  value: string,
  onChange(value: string, event: AceChangeEvent): void,
|};

export default function useContent(
  remoteCursorsDispatch: RemoteCursorsAction => void,
  controller: Controller,
): ContentHook {
  const [value, setValue] = React.useState<string>('');

  return {
    value,
    onChange(_value: string, { action, lines, start, end }: AceChangeEvent) {
      console.log(action, start, end);

      switch (action) {
        case 'insert': {
          remoteCursorsDispatch({ type: 'INSERT', start, end });
          controller.localInsert(lines, { line: start.row, ch: start.column });
          setValue(controller.crdt.toText());
          break;
        }
        case 'remove': {
          remoteCursorsDispatch({ type: 'DELETE', start, end });
          controller.localDelete(
            { line: start.row, ch: start.column },
            { line: end.row, ch: end.column },
          );
          setValue(controller.crdt.toText());
          break;
        }
        default:
          throw 'unreachable';
      }
    },
  };
}
