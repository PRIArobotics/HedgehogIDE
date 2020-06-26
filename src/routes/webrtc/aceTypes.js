// @flow

import AceEditor from 'react-ace';

export type AceRef = React.ElementRef<typeof AceEditor>;

export type AceMarker = {|
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  className: string,
  type: string,
|};

export type AcePosition = {| row: number, column: number |};

export type AceChangeEvent =
  | {| action: 'insert', lines: string[], start: AcePosition, end: AcePosition |}
  | {| action: 'remove', lines: string[], start: AcePosition, end: AcePosition |};
