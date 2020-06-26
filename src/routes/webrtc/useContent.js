// @flow

import * as React from 'react';

import type { AcePosition, AceChangeEvent } from './aceTypes';
import { type RemoteCursorsAction } from './useRemoteCursors';

type ContentHook = {|
  value: string,
  onChange(value: string, event: AceChangeEvent): void,
|};

export default function useContent(
  remoteCursorsDispatch: (RemoteCursorsAction) => void,
): ContentHook {
  const [value, setValue] = React.useState<string>('');

  return {
    value,
    onChange(newValue: string, { action, lines, start, end }: AceChangeEvent) {
      setValue(newValue);
      console.log(action, start, end);

      switch (action) {
        case 'insert': {
          // this.processInsert(chars, startPos, endPos);
          remoteCursorsDispatch({ type: 'INSERT', start, end });
          break;
        }
        case 'remove': {
          // this.processDelete(chars, startPos, endPos);
          // remoteCursorsDispatch({ type: 'DELETE', start, end });
          break;
        }
        default:
          throw 'unreachable';
      }
    },
  }
}
