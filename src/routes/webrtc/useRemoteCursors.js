// @flow

import * as React from 'react';

import type { AceMarker, AcePosition } from './aceTypes';

function mapObject<T, U>(obj: {| [key: string]: T |}, fn: (value: T, key: string) => U): {| [key: string]: U |} {
  const entries = Object.entries(obj);
  const newEntries = entries.map(([key, value0]) => {
    // $FlowExpectError
    const value: T = value0;
    return [key, fn(value, key)];
  });
  return Object.fromEntries(newEntries);
}

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

export type RemoteCursorsAction =
  | {| type: 'SET', siteId: string, remoteCursor: RemoteCursor |}
  | {| type: 'REMOVE', siteId: string |}
  | {| type: 'INSERT', start: AcePosition, end: AcePosition |}
  | {| type: 'DELETE', start: AcePosition, end: AcePosition |};

function remoteCursorsReducer(state: RemoteCursors, action: RemoteCursorsAction): RemoteCursors {
  switch (action.type) {
    case 'SET': {
      const { siteId, remoteCursor } = action;

      return { ...state, [siteId]: remoteCursor };
    }
    case 'REMOVE': {
      const { siteId } = action;

      const { [siteId]: _, ...newState } = state;
      return newState;
    }
    case 'INSERT': {
      const { start, end } = action;

      const rowDelta = end.row - start.row;
      const columnDelta = rowDelta === 0 ? end.column - start.column : end.column;

      function mapPosition({ row, column }: AcePosition): AcePosition {
        if (row > start.row) {
          // the position was shifted down a number of lines
          return { row: row + rowDelta, column };
        } else if (row === start.row && column > start.column) {
          if (rowDelta > 0) {
            // the position was shifted to a new line,
            // shift left the number of characters remaining on the old line
            return { row: row + rowDelta, column: column - start.column };
          } else {
            // the position was shifted within the line
            return { row, column: column + columnDelta };
          }
        } else {
          // the position was not shifted
          return { row, column };
        }
      }

      return mapObject(state, ({ selection, cursor }, siteId) => ({
        selection: selection === null ? null : {
          start: mapPosition(selection.start),
          end: mapPosition(selection.end),
        },
        cursor: cursor === null ? null : mapPosition(cursor),
      }));
    }
    case 'DELETE': {
      const { start, end } = action;

      const rowDelta = end.row - start.row;
      const columnDelta = rowDelta === 0 ? end.column - start.column : end.column;

      function mapPosition({ row, column }: AcePosition): AcePosition {
        if (row > end.row) {
          // the position was shifted up a number of lines
          return { row: row - rowDelta, column };
        } else if (row === end.row && column > end.column) {
          if (rowDelta > 0) {
            // the position was shifted to a new line,
            // shift right the number of characters remaining on the new line
            return { row: row - rowDelta, column: column + start.column };
          } else {
            // the position was shifted within the line
            return { row, column: column - columnDelta };
          }
        } else {
          // the position was not shifted
          return { row, column };
        }
      }

      return mapObject(state, ({ selection, cursor }, siteId) => ({
        selection: selection === null ? null : {
          start: mapPosition(selection.start),
          end: mapPosition(selection.end),
        },
        cursor: cursor === null ? null : mapPosition(cursor),
      }));
    }
    default:
      // eslint-disable-next-line no-throw-literal
      throw 'unreachable';
  }
}

type RemoteCursorsHook = {|
  dispatch(action: RemoteCursorsAction): void,
  getAceMarkers(): AceMarker[],
|};

export default function useRemoteCursors(
  getClassName: (siteId: string, type: 'selection' | 'cursor') => string,
): RemoteCursorsHook {
  const [cursors, dispatch] = React.useReducer<RemoteCursors, RemoteCursorsAction>(
    remoteCursorsReducer,
    {
      foo: {
        selection: {
          start: { row: 0, column: 1 },
          end: { row: 0, column: 3 },
        },
        cursor: { row: 0, column: 3 },
      },
    },
  );

  return {
    dispatch,
    getAceMarkers() {
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
    },
  };
}
