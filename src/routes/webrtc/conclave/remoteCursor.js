// @flow

type Position = {|
  line: number,
  ch: number,
|};

export default class RemoteCursor {
  siteId: string;
  position: Position;

  constructor(siteId: string, position: Position) {
    this.position = position;
  }
}
