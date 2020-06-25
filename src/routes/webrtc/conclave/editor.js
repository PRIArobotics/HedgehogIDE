// @flow

import SimpleMDE from 'simplemde';

import Controller from './controller';

type Position = {|
  line: number,
  ch: number,
|};

type Positions = {|
  from: Position,
  to: Position,
|};

type RemoteCursors = {|
  [siteId: string]: Position,
|};

class Editor {
  controller: Controller;
  mde: SimpleMDE;
  remoteCursors: RemoteCursors;

  constructor(mde: SimpleMDE) {
    this.controller = null;
    this.mde = mde;
    this.remoteCursors = {};
    this.customTabBehavior();
  }

  customTabBehavior() {
    this.mde.codemirror.setOption('extraKeys', {
      Tab(codemirror) {
        codemirror.replaceSelection('\t');
      },
    });
  }

  bindChangeEvent() {
    this.mde.codemirror.on('change', (_, changeObj) => {
      if (changeObj.origin === 'setValue') return;
      if (changeObj.origin === 'insertText') return;
      if (changeObj.origin === 'deleteText') return;

      switch (changeObj.origin) {
        case 'redo':
        case 'undo':
          this.processUndoRedo(changeObj);
          break;
        case '*compose':
        case '+input':
        //          this.processInsert(changeObj);    // uncomment this line for palindromes!
        case 'paste':
          this.processInsert(changeObj);
          break;
        case '+delete':
        case 'cut':
          this.processDelete(changeObj);
          break;
        default:
          throw new Error('Unknown operation attempted in editor.');
      }
    });
  }

  processInsert(changeObj) {
    this.processDelete(changeObj);
    const chars = this.extractChars(changeObj.text);
    const startPos = changeObj.from;

    this.updateRemoteCursorsInsert(chars, changeObj.to);
    this.controller.localInsert(chars, startPos);
  }

  isEmpty(textArr: string[]) {
    return textArr.length === 1 && textArr[0].length === 0;
  }

  processDelete(changeObj) {
    if (this.isEmpty(changeObj.removed)) return;
    const startPos = changeObj.from;
    const endPos = changeObj.to;
    const chars = this.extractChars(changeObj.removed);

    this.updateRemoteCursorsDelete(chars, changeObj.to, changeObj.from);
    this.controller.localDelete(startPos, endPos);
  }

  processUndoRedo(changeObj) {
    if (changeObj.removed[0].length > 0) {
      this.processDelete(changeObj);
    } else {
      this.processInsert(changeObj);
    }
  }

  extractChars(text: string[]): string {
    if (text[0] === '' && text[1] === '' && text.length === 2) {
      return '\n';
    } else {
      return text.join('\n');
    }
  }

  replaceText(text: string) {
    const cursor = this.mde.codemirror.getCursor();
    this.mde.value(text);
    this.mde.codemirror.setCursor(cursor);
  }

  insertText(value: string, positions: Positions, siteId: string) {
    const localCursor: Position = this.mde.codemirror.getCursor();
    const delta = this.generateDeltaFromChars(value);

    this.mde.codemirror.replaceRange(value, positions.from, positions.to, 'insertText');
    this.updateRemoteCursorsInsert(positions.to, siteId);
    this.updateRemoteCursor(positions.to, siteId, 'insert', value);

    if (localCursor.line > positions.to.line) {
      localCursor.line += delta.line;
    } else if (localCursor.line === positions.to.line && localCursor.ch > positions.to.ch) {
      if (delta.line > 0) {
        localCursor.line += delta.line;
        localCursor.ch -= positions.to.ch;
      }

      localCursor.ch += delta.ch;
    }

    this.mde.codemirror.setCursor(localCursor);
  }

  removeCursor(siteId: string) {
    delete this.remoteCursors[siteId];
  }

  updateRemoteCursorsInsert(chars: string, position: Position, siteId: string) {
    const positionDelta = this.generateDeltaFromChars(chars);

    for (const [cursorSiteId, cursorPosition] of Object.entries(this.remoteCursors)) {
      if (cursorSiteId === siteId) continue;
      // $FlowExpectError
      const newPosition: Position = { ...cursorPosition };

      if (newPosition.line > position.line) {
        newPosition.line += positionDelta.line;
      } else if (newPosition.line === position.line && newPosition.ch > position.ch) {
        if (positionDelta.line > 0) {
          newPosition.line += positionDelta.line;
          newPosition.ch -= position.ch;
        }

        newPosition.ch += positionDelta.ch;
      }

      this.remoteCursors[cursorSiteId] = newPosition;
    }
  }

  updateRemoteCursorsDelete(chars: string, to: Position, from: Position, siteId: string) {
    const positionDelta = this.generateDeltaFromChars(chars);

    for (const [cursorSiteId, cursorPosition] of Object.entries(this.remoteCursors)) {
      if (cursorSiteId === siteId) continue;
      // $FlowExpectError
      const newPosition: Position = { ...cursorPosition };

      if (newPosition.line > to.line) {
        newPosition.line -= positionDelta.line;
      } else if (newPosition.line === to.line && newPosition.ch > to.ch) {
        if (positionDelta.line > 0) {
          newPosition.line -= positionDelta.line;
          newPosition.ch += from.ch;
        }

        newPosition.ch -= positionDelta.ch;
      }

      this.remoteCursors[cursorSiteId] = newPosition;
    }
  }

  updateRemoteCursor(position: Position, siteId: string, opType, value: string) {
    const newPosition = { ...position };

    if (opType === 'insert') {
      if (value === '\n') {
        newPosition.line += 1;
        newPosition.ch = 0;
      } else {
        newPosition.ch += 1;
      }
    } else {
      newPosition.ch -= 1;
    }

    this.remoteCursors[siteId] = newPosition;
  }

  deleteText(value: string, positions: Positions, siteId: string) {
    const localCursor = this.mde.codemirror.getCursor();
    const delta = this.generateDeltaFromChars(value);

    this.mde.codemirror.replaceRange('', positions.from, positions.to, 'deleteText');
    this.updateRemoteCursorsDelete(positions.to, siteId);
    this.updateRemoteCursor(positions.to, siteId, 'delete');

    if (localCursor.line > positions.to.line) {
      localCursor.line -= delta.line;
    } else if (localCursor.line === positions.to.line && localCursor.ch > positions.to.ch) {
      if (delta.line > 0) {
        localCursor.line -= delta.line;
        localCursor.ch += positions.from.ch;
      }

      localCursor.ch -= delta.ch;
    }

    this.mde.codemirror.setCursor(localCursor);
  }

  findLinearIdx(lineIdx: number, chIdx: number): number {
    const linesOfText = this.controller.crdt.text.split('\n');

    let index = 0;
    for (let i = 0; i < lineIdx; i += 1) {
      index += linesOfText[i].length + 1;
    }

    return index + chIdx;
  }

  generateDeltaFromChars(chars: string) {
    const delta = { line: 0, ch: 0 };
    let counter = 0;

    while (counter < chars.length) {
      if (chars[counter] === '\n') {
        delta.line += 1;
        delta.ch = 0;
      } else {
        delta.ch += 1;
      }

      counter += 1;
    }

    return delta;
  }
}

export default Editor;
