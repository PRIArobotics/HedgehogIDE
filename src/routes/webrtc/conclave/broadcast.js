// @flow

import Peer from 'peerjs';

import Controller from './controller';

type DataConnection = Peer.DataConnection;

type Operation =
  | {| type: 'insert' |}
  | {| type: 'delete' |}
  | {| type: 'add to network', newPeer: string, newSite: string |}
  | {| type: 'remove from network', oldPeer: string |}
  | {| type: 'connRequest', peerId: string, siteId: string |}
  | {| type: 'syncResponse', peerId: string |}
  | {| type: 'syncCompleted', peerId: string |};

type Heartbeat = {|
  start(): void,
  stop(): void,
|};

class Broadcast {
  controller: Controller;
  peer: Peer;
  outConns: DataConnection[];
  inConns: DataConnection[];
  outgoingBuffer: string[];
  MAX_BUFFER_SIZE: number;
  heartbeat: Heartbeat;

  constructor() {
    this.controller = null;
    this.peer = null;
    this.outConns = [];
    this.inConns = [];
    this.outgoingBuffer = [];
    this.MAX_BUFFER_SIZE = 40;
  }

  send(operation: Operation) {
    const operationJSON = JSON.stringify(operation);
    if (operation.type === 'insert' || operation.type === 'delete') {
      this.addToOutgoingBuffer(operationJSON);
    }
    this.outConns.forEach(conn => conn.send(operationJSON));
  }

  addToOutgoingBuffer(operationJSON: string) {
    if (this.outgoingBuffer.length === this.MAX_BUFFER_SIZE) {
      this.outgoingBuffer.shift();
    }

    this.outgoingBuffer.push(operationJSON);
  }

  processOutgoingBuffer(peerId: string) {
    const connection = this.outConns.find(conn => conn.peer === peerId);
    this.outgoingBuffer.forEach(op => {
      connection.send(op);
    });
  }

  bindServerEvents(targetPeerId: string | null, peer: Peer) {
    this.peer = peer;
    this.onOpen(targetPeerId);
    this.heartbeat = this.startPeerHeartBeat(peer);
  }

  startPeerHeartBeat(peer: Peer): Heartbeat {
    let timeoutId = null;
    const heartbeat = () => {
      timeoutId = setTimeout(heartbeat, 20000);
      if (peer.socket._wsOpen()) {
        peer.socket.send({ type: 'HEARTBEAT' });
      }
    };

    heartbeat();

    return {
      start() {
        if (timeoutId === null) {
          heartbeat();
        }
      },
      stop() {
        clearTimeout(timeoutId);
        timeoutId = null;
      },
    };
  }

  onOpen(targetPeerId: string | null) {
    this.peer.on('open', id => {
      this.onPeerConnection();
      this.onError();
      this.onDisconnect();
      if (targetPeerId === null) {
        this.controller.addToNetwork(id, this.controller.siteId);
      } else {
        this.requestConnection(targetPeerId, id, this.controller.siteId);
      }
    });
  }

  onError() {
    this.peer.on('error', err => {
      const pid = String(err).replace('Error: Could not connect to peer ', '');
      this.removeFromConnections(pid);
      console.log(err.type);
      if (!this.peer.disconnected) {
        this.controller.findNewTarget();
      }
    });
  }

  onDisconnect() {
    this.peer.on('disconnected', () => {
      this.controller.lostConnection();
    });
  }

  requestConnection(target: string, peerId: string, siteId: string) {
    const conn = this.peer.connect(target);
    this.addToOutConns(conn);
    conn.on('open', () => {
      conn.send(
        JSON.stringify({
          type: 'connRequest',
          peerId,
          siteId,
        }),
      );
    });
  }

  evaluateRequest(peerId: string, siteId: string) {
    if (this.hasReachedMax()) {
      this.forwardConnRequest(peerId, siteId);
    } else {
      this.acceptConnRequest(peerId, siteId);
    }
  }

  hasReachedMax(): boolean {
    const halfTheNetwork = Math.ceil(this.controller.network.length / 2);
    const tooManyInConns = this.inConns.length > Math.max(halfTheNetwork, 5);
    const tooManyOutConns = this.outConns.length > Math.max(halfTheNetwork, 5);

    return tooManyInConns || tooManyOutConns;
  }

  forwardConnRequest(peerId: string, siteId: string) {
    const connected = this.outConns.filter(conn => conn.peer !== peerId);
    const randomIdx = Math.floor(Math.random() * connected.length);
    connected[randomIdx].send(
      JSON.stringify({
        type: 'connRequest',
        peerId,
        siteId,
      }),
    );
  }

  addToOutConns(connection: DataConnection) {
    if (!!connection && !this.isAlreadyConnectedOut(connection)) {
      this.outConns.push(connection);
    }
  }

  addToInConns(connection: DataConnection) {
    if (!!connection && !this.isAlreadyConnectedIn(connection)) {
      this.inConns.push(connection);
    }
  }

  addToNetwork(peerId: string, siteId: string) {
    this.send({
      type: 'add to network',
      newPeer: peerId,
      newSite: siteId,
    });
  }

  removeFromNetwork(peerId: string) {
    this.send({
      type: 'remove from network',
      oldPeer: peerId,
    });
    this.controller.removeFromNetwork(peerId);
  }

  removeFromConnections(peer: string) {
    this.inConns = this.inConns.filter(conn => conn.peer !== peer);
    this.outConns = this.outConns.filter(conn => conn.peer !== peer);
    this.removeFromNetwork(peer);
  }

  isAlreadyConnectedOut(connection: DataConnection) {
    if (connection.peer) {
      return !!this.outConns.find(conn => conn.peer === connection.peer);
    } else {
      return !!this.outConns.find(conn => conn.peer.id === connection);
    }
  }

  isAlreadyConnectedIn(connection: DataConnection) {
    if (connection.peer) {
      return !!this.inConns.find(conn => conn.peer === connection.peer);
    } else {
      return !!this.inConns.find(conn => conn.peer.id === connection);
    }
  }

  onPeerConnection() {
    this.peer.on('connection', connection => {
      this.onConnection(connection);
      this.onData(connection);
      this.onConnClose(connection);
    });
  }

  acceptConnRequest(peerId: string, siteId: string) {
    const connBack = this.peer.connect(peerId);
    this.addToOutConns(connBack);
    this.controller.addToNetwork(peerId, siteId);

    const initialData = JSON.stringify({
      type: 'syncResponse',
      siteId: this.controller.siteId,
      peerId: this.peer.id,
      initialStruct: this.controller.crdt.struct,
      initialVersions: this.controller.vector.versions,
      network: this.controller.network,
    });

    if (connBack.open) {
      connBack.send(initialData);
    } else {
      connBack.on('open', () => {
        connBack.send(initialData);
      });
    }
  }

  onConnection(connection: DataConnection) {
    this.addToInConns(connection);
  }

  onData(connection: DataConnection) {
    connection.on('data', data => {
      const dataObj: Operation = JSON.parse(data);

      switch (dataObj.type) {
        case 'connRequest':
          this.evaluateRequest(dataObj.peerId, dataObj.siteId);
          break;
        case 'syncResponse':
          this.processOutgoingBuffer(dataObj.peerId);
          this.controller.handleSync(dataObj);
          break;
        case 'syncCompleted':
          this.processOutgoingBuffer(dataObj.peerId);
          break;
        case 'add to network':
          this.controller.addToNetwork(dataObj.newPeer, dataObj.newSite);
          break;
        case 'remove from network':
          this.controller.removeFromNetwork(dataObj.oldPeer);
          break;
        default:
          this.controller.handleRemoteOperation(dataObj);
      }
    });
  }

  randomId(): string | null {
    const possConns = this.inConns.filter(conn => this.peer.id !== conn.peer);
    const randomIdx = Math.floor(Math.random() * possConns.length);
    if (possConns[randomIdx]) {
      return possConns[randomIdx].peer;
    } else {
      return null;
    }
  }

  onConnClose(connection: DataConnection) {
    connection.on('close', () => {
      this.removeFromConnections(connection.peer);
      if (!this.hasReachedMax()) {
        this.controller.findNewTarget();
      }
    });
  }
}

export default Broadcast;
