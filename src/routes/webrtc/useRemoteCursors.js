// @flow

import * as React from 'react';

import { type AcePosition } from './conclave/editor';

type AceMarker = {|
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  className: string,
  type: string,
|};

type RemoteCursor = {|
  selection: {|
    start: AcePosition,
    end: AcePosition,
  |} | null,
  cursor: AcePosition | null,
|};

type RemoteCursors = {|
  [siteId: string]: RemoteCursor,
|};

type RemoteCursorsHook = {|
  getAceMarkers(
    getClassName: (siteId: string, type: 'selection' | 'cursor') => string,
  ): AceMarker[],
|};

export default function useRemoteCursors(): RemoteCursorsHook {
  const [cursors, setCursors] = React.useState<RemoteCursors>({
    'foo': {
      selection: {
        start: { row: 0, column: 1 },
        end: { row: 0, column: 3 },
      },
      cursor: { row: 0, column: 3 },
    }
  });

  return {
    getAceMarkers(getClassName: (siteId: string, type: 'selection' | 'cursor') => string) {
      const markers = [];

      for (const [siteId, remoteCursor] of Object.entries(cursors)) {
        // $FlowExpectError
        const { selection, cursor }: RemoteCursor = remoteCursor;

        if (selection !== null) {
          markers.push({
            startRow: selection.start.row,
            startCol: selection.start.column,
            endRow: selection.end.row,
            endCol: selection.end.column,
            className: getClassName(siteId, 'selection'),
            type: 'text',
          });
        }
        if (cursor !== null) {
          markers.push({
            startRow: cursor.row,
            startCol: cursor.column,
            endRow: cursor.row,
            endCol: cursor.column + 1,
            className: getClassName(siteId, 'cursor'),
            type: 'text',
          });
        }
      }

      return markers;
    }
  };
}
