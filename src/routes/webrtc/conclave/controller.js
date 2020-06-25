import Peer from 'peerjs';
import UUID from 'uuid/v1';

import Editor from './editor';
import CRDT from './crdt';
import Char from './char';
import Identifier from './identifier';
import VersionVector from './versionVector';
import Version from './version';
import Broadcast from './broadcast';

type NetworkEntry = {|
  peerId: string,
  siteId: string,
|};

class Controller {
  siteId: string;
  host: string;
  buffer: any[];
  network: NetworkEntry[];
  urlId: string | null;

  broadcast: Broadcast;
  editor: Editor;
  vector: VersionVector;
  crdt: CRDT;

  constructor(
    targetPeerId: string | null,
    host: string,
    peer: Peer,
    broadcast: Broadcast,
    editor: Editor,
  ) {
    this.siteId = UUID();
    this.host = host;
    this.buffer = [];
    this.network = [];
    this.urlId = targetPeerId;

    this.broadcast = broadcast;
    this.broadcast.controller = this;
    this.broadcast.bindServerEvents(targetPeerId, peer);

    this.editor = editor;
    this.editor.controller = this;
    this.editor.bindChangeEvent();

    this.vector = new VersionVector(this.siteId);
    this.crdt = new CRDT(this);
  }

  lostConnection() {
    console.log('disconnected');
  }

  populateCRDT(initialStruct) {
    const struct = initialStruct.map(line =>
      line.map(
        ch =>
          new Char(
            ch.value,
            ch.counter,
            ch.siteId,
            ch.position.map(id => new Identifier(id.digit, id.siteId)),
          ),
      ),
    );

    this.crdt.struct = struct;
    this.editor.replaceText(this.crdt.toText());
  }

  populateVersionVector(initialVersions) {
    const versions = initialVersions.map(ver => {
      const version = new Version(ver.siteId);
      version.counter = ver.counter;
      ver.exceptions.forEach(ex => version.exceptions.push(ex));
      return version;
    });

    versions.forEach(version => this.vector.versions.push(version));
  }

  addToNetwork(peerId, siteId) {
    if (!this.network.find(obj => obj.siteId === siteId)) {
      this.network.push({ peerId, siteId });
      this.broadcast.addToNetwork(peerId, siteId);
    }
  }

  removeFromNetwork(peerId) {
    const peerObj = this.network.find(obj => obj.peerId === peerId);
    const idx = this.network.indexOf(peerObj);
    if (idx >= 0) {
      const deletedObj = this.network.splice(idx, 1)[0];
      this.editor.removeCursor(deletedObj.siteId);
      this.broadcast.removeFromNetwork(peerId);
    }
  }

  findNewTarget() {
    const connected = this.broadcast.outConns.map(conn => conn.peer);
    const unconnected = this.network.filter(obj => connected.indexOf(obj.peerId) === -1);

    const possibleTargets = unconnected.filter(obj => obj.peerId !== this.broadcast.peer.id);

    if (possibleTargets.length > 0) {
      const randomIdx = Math.floor(Math.random() * possibleTargets.length);
      const newTarget = possibleTargets[randomIdx].peerId;
      this.broadcast.requestConnection(newTarget, this.broadcast.peer.id, this.siteId);
    }
  }

  handleSync(syncObj) {
    syncObj.network.forEach(obj => this.addToNetwork(obj.peerId, obj.siteId));

    if (this.crdt.totalChars() === 0) {
      this.populateCRDT(syncObj.initialStruct);
      this.populateVersionVector(syncObj.initialVersions);
    }

    this.syncCompleted(syncObj.peerId);
  }

  syncCompleted(peerId) {
    const completedMessage = JSON.stringify({
      type: 'syncCompleted',
      peerId: this.broadcast.peer.id,
    });

    let connection = this.broadcast.outConns.find(conn => conn.peer === peerId);

    if (connection) {
      connection.send(completedMessage);
    } else {
      connection = this.broadcast.peer.connect(peerId);
      this.broadcast.addToOutConns(connection);
      connection.on('open', () => {
        connection.send(completedMessage);
      });
    }
  }

  handleRemoteOperation(operation) {
    if (this.vector.hasBeenApplied(operation.version)) return;

    if (operation.type === 'insert') {
      this.applyOperation(operation);
    } else if (operation.type === 'delete') {
      this.buffer.push(operation);
    }

    this.processDeletionBuffer();
    this.broadcast.send(operation);
  }

  processDeletionBuffer() {
    let i = 0;
    let deleteOperation;

    while (i < this.buffer.length) {
      deleteOperation = this.buffer[i];

      if (this.hasInsertionBeenApplied(deleteOperation)) {
        this.applyOperation(deleteOperation);
        this.buffer.splice(i, 1);
      } else {
        i += 1;
      }
    }
  }

  hasInsertionBeenApplied(operation) {
    const charVersion = { siteId: operation.char.siteId, counter: operation.char.counter };
    return this.vector.hasBeenApplied(charVersion);
  }

  applyOperation(operation) {
    const { char } = operation;
    const identifiers = char.position.map(pos => new Identifier(pos.digit, pos.siteId));
    const newChar = new Char(char.value, char.counter, char.siteId, identifiers);

    if (operation.type === 'insert') {
      this.crdt.handleRemoteInsert(newChar);
    } else if (operation.type === 'delete') {
      this.crdt.handleRemoteDelete(newChar, operation.version.siteId);
    }

    this.vector.update(operation.version);
  }

  localDelete(startPos, endPos) {
    this.crdt.handleLocalDelete(startPos, endPos);
  }

  localInsert(chars, startPos) {
    for (let i = 0; i < chars.length; i += 1) {
      if (chars[i - 1] === '\n') {
        startPos.line += 1;
        startPos.ch = 0;
      }
      this.crdt.handleLocalInsert(chars[i], startPos);
      startPos.ch += 1;
    }
  }

  broadcastInsertion(char) {
    const operation = {
      type: 'insert',
      char,
      version: this.vector.getLocalVersion(),
    };

    this.broadcast.send(operation);
  }

  broadcastDeletion(char, version) {
    const operation = {
      type: 'delete',
      char,
      version,
    };

    this.broadcast.send(operation);
  }

  insertIntoEditor(value, pos, siteId) {
    const positions = {
      from: {
        line: pos.line,
        ch: pos.ch,
      },
      to: {
        line: pos.line,
        ch: pos.ch,
      },
    };

    this.editor.insertText(value, positions, siteId);
  }

  deleteFromEditor(value, pos, siteId) {
    let positions;

    if (value === '\n') {
      positions = {
        from: {
          line: pos.line,
          ch: pos.ch,
        },
        to: {
          line: pos.line + 1,
          ch: 0,
        },
      };
    } else {
      positions = {
        from: {
          line: pos.line,
          ch: pos.ch,
        },
        to: {
          line: pos.line,
          ch: pos.ch + 1,
        },
      };
    }

    this.editor.deleteText(value, positions, siteId);
  }
}

export default Controller;
