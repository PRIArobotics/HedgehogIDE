// @flow

import Controller from './controller';

import type { AceRef, AcePosition, AceChangeEvent } from '../aceTypes';

export type Position = {|
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

function toConclavePosition({ row, column }: AcePosition) {
  return { line: row, ch: column };
}

class Editor {
  ace: AceRef;
  controller: Controller;
  remoteCursors: RemoteCursors;

  constructor(controller: Controller, ace: AceRef) {
    this.controller = controller;
    this.ace = ace;
    this.remoteCursors = {};
    this.bindChangeEvent();
  }

  bindChangeEvent() {
    this.ace.editor.on('change', ({ action, lines, start, end }: AceChangeEvent) => {
      const chars = this.extractChars(lines);
      const startPos = toConclavePosition(start);
      const endPos = toConclavePosition(end);

      switch (action) {
        case 'insert': {
          this.processInsert(chars, startPos, endPos);
          break;
        }
        case 'remove': {
          this.processDelete(chars, startPos, endPos);
          this.controller.localDelete(toConclavePosition(start), toConclavePosition(end));
          break;
        }
        default:
          throw 'unreachable';
      }
    });
  }

  processInsert(chars: string, startPos: Position, endPos: Position) {
    this.updateRemoteCursorsInsert(chars, endPos);
    this.controller.localInsert(chars, startPos);
  }

  processDelete(chars: string, startPos: Position, endPos: Position) {
    this.updateRemoteCursorsDelete(chars, endPos, startPos);
    this.controller.localDelete(startPos, endPos);
  }

  extractChars(text: string[]): string {
    if (text[0] === '' && text[1] === '' && text.length === 2) {
      return '\n';
    } else {
      return text.join('\n');
    }
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

  updateRemoteCursor(
    position: Position,
    siteId: string,
    opType: 'insert' | 'delete',
    value: string,
  ) {
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
