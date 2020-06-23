import UUID from 'uuid/v1';
import CRDT from './crdtLinear';
import * as Util from './utilLinear';

function mockController() {
  return {
    siteId: UUID(),
    broadcastInsertion() {},
    broadcastDeletion() {},
    insertIntoEditor() {},
    deleteFromEditor() {},
    vector: {
      localVersion: {
        counter: 0,
      },
      increment() {
        this.localVersion.counter++;
      },
    },
  };
}

let funcs;
let crdt;
let xs;
let ys;
let data;
let name;
let title;
const bases = [32, 2064];
const boundaries = [10, 100];
const ops = [1000, 5000, 10000, 20000];

// local insertions

funcs = [
  [Util.insertRandom, 'random'],
  [Util.insertEnd, 'at end'],
  [Util.insertBeginning, 'at beginning'],
];
data = [];

funcs.forEach(func => {
  bases.forEach(base => {
    boundaries.forEach(boundary => {
      xs = [];
      ys = [];
      crdt = new CRDT(mockController(), base, boundary, 'random', 2);
      crdt.insertText = function() {};
      crdt.deleteText = function() {};
      ops.forEach(op => {
        xs.push(op);
        ys.push(func[0](crdt, op));
        crdt.struct = [];
      });
      name = `base: ${base}, boundary: ${boundary}, ${func[1]}`;
      data.push({ x: xs, y: ys, type: 'scatter', name });
    });
  });
});

title = 'Local Insertions, Different Bases and Boundaries (mult = 2, strategy = random)';
Plotly.newPlot('g0', data, { title, height: 600 });

// local deletions

funcs = [
  [Util.deleteRandom, 'random'],
  [Util.deleteEnd, 'at end'],
  [Util.deleteEnd, 'at beginning'],
];
data = [];

funcs.forEach(func => {
  bases.forEach(base => {
    boundaries.forEach(boundary => {
      xs = [];
      ys = [];
      crdt = new CRDT(mockController(), base, boundary, 'random', 2);
      crdt.insertText = function() {};
      crdt.deleteText = function() {};
      ops.forEach(op => {
        xs.push(op);
        Util.insertRandom(crdt, op);
        ys.push(func[0](crdt, op));
        crdt.struct = [];
      });
      name = `base: ${base}, boundary: ${boundary}, ${func[1]}`;
      data.push({ x: xs, y: ys, type: 'scatter', name });
    });
  });
});

title = 'Local Deletions, Different Bases and Boundaries (mult = 2, strategy = random)';
Plotly.newPlot('g1', data, { title, height: 600 });

// remote insertions

funcs = [
  [Util.remoteInsertRandom, 'random'],
  [Util.remoteInsertEnd, 'at end'],
  [Util.remoteInsertBeginning, 'at beginning'],
];
data = [];

funcs.forEach(func => {
  bases.forEach(base => {
    boundaries.forEach(boundary => {
      xs = [];
      ys = [];
      crdt = new CRDT(mockController(), base, boundary, 'random', 2);
      crdt.insertText = function() {};
      crdt.deleteText = function() {};
      ops.forEach(op => {
        xs.push(op);
        ys.push(func[0](crdt, op));
        crdt.struct = [];
      });
      name = `base: ${base}, boundary: ${boundary}, ${func[1]}`;
      data.push({ x: xs, y: ys, type: 'scatter', name });
    });
  });
});

title = 'Remote Insertions, Different Bases and Boundaries (mult = 2, strategy = random)';
Plotly.newPlot('g2', data, { title, height: 600 });

// remote deletions

funcs = [
  [Util.remoteDeleteRandom, 'random'],
  [Util.remoteDeleteEnd, 'at end'],
  [Util.remoteDeleteBeginning, 'at beginning'],
];
data = [];

funcs.forEach(func => {
  bases.forEach(base => {
    boundaries.forEach(boundary => {
      xs = [];
      ys = [];
      ops.forEach(op => {
        crdt = new CRDT(mockController(), base, boundary, 'random', 2);
        crdt.insertText = function() {};
        crdt.deleteText = function() {};
        Util.remoteInsertRandom(crdt, op);
        xs.push(op);
        ys.push(func[0](crdt, op));
      });
      name = `base: ${base}, boundary: ${boundary}, ${func[1]}`;
      data.push({ x: xs, y: ys, type: 'scatter', name });
    });
  });
});

title = 'Remote Deletions, Different Bases and Boundaries (mult = 2, strategy = random)';
Plotly.newPlot('g3', data, { title, height: 600 });
