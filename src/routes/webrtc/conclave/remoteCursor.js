import SimpleMDE from 'simplemde';

type Position = {|
  line: number,
  ch: number,
|};

export default class RemoteCursor {
  mde: SimpleMDE;
  siteId: string;
  lastPosition: Position;

  constructor(mde: SimpleMDE, siteId: string, position) {
    this.mde = mde;
    this.set(position);
  }

  set(position) {
    const coords = this.mde.codemirror.cursorCoords(position, 'local');
    this.mde.codemirror.getDoc().setBookmark(position, { widget: this.cursor });
    this.lastPosition = position;
  }
}
