import UUID from 'uuid/v1';
import Char from './char';
import CRDT from './crdt';

export function mockController() {
  return {
    siteId: UUID(),
    broadcastInsertion() {},
    broadcastDeletion() {},
    insertIntoEditor() {},
    deleteFromEditor() {},
    vector: {
      getLocalVersion: () => {},
      localVersion: {
        counter: 0,
      },
      increment() {
        this.localVersion.counter++;
      },
    },
  };
}

function insertRandom(crdt, numberOfOperations) {
  let counter = 0;
  let line = 0;
  let ch;
  let pos;
  const start = Date.now();

  for (let i = 0; i < numberOfOperations; i++) {
    if (counter === 100) {
      pos = { line, ch: counter };
      crdt.handleLocalInsert('\n', pos);

      line++;
      counter = 0;
    } else {
      ch = Math.floor(Math.random() * counter);
      pos = { line, ch };
      crdt.handleLocalInsert('a', pos);
      ``;
      counter++;
    }
  }

  const end = Date.now();
  return end - start;
}

function remoteInsertRandom(crdt, numberOfOperations) {
  const chars = shuffle(generateChars(numberOfOperations));
  return remoteInsert(crdt, chars);
}

function remoteInsert(crdt, chars) {
  const start = Date.now();

  chars.forEach(char => crdt.handleRemoteInsert(char));

  const end = Date.now();
  return end - start;
}

function deleteRandom(crdt) {
  const totalChars = crdt.totalChars();
  const start = Date.now();
  let line;
  let ch;
  let startPos;
  let endPos;

  for (let i = totalChars; i > 0; i--) {
    line = Math.floor(Math.random() * crdt.struct.length);
    ch = Math.floor(Math.random() * crdt.struct[line].length);
    startPos = { line, ch };
    endPos = { line, ch: ch + 1 };
    crdt.handleLocalDelete(startPos, endPos);
  }

  const end = Date.now();
  return end - start;
}

function remoteDeleteRandom(crdt) {
  const charsToDelete = [].concat.apply([], crdt.struct);

  return remoteDelete(crdt, shuffle(charsToDelete));
}

function remoteDelete(crdt, chars) {
  const start = Date.now();

  chars.forEach(char => crdt.handleRemoteDelete(char));

  const end = Date.now();
  return end - start;
}

function insertBeginning(crdt, numberOfOperations) {
  let counter = 0;
  let line = 0;
  let ch;
  let pos;
  const start = Date.now();

  for (let i = 0; i < numberOfOperations; i++) {
    if (counter === 100) {
      pos = { line, ch: counter };
      crdt.handleLocalInsert('\n', pos);

      line++;
      counter = 0;
    } else {
      pos = { line, ch: 0 };
      crdt.handleLocalInsert('a', pos);

      counter++;
    }
  }

  const end = Date.now();
  return end - start;
}

function deleteBeginning(crdt) {
  const totalChars = crdt.totalChars();
  const start = Date.now();

  for (let i = totalChars; i > 0; i--) {
    const startPos = { line: 0, ch: 0 };
    const endPos = { line: 0, ch: 1 };

    crdt.handleLocalDelete(startPos, endPos);
  }

  const end = Date.now();
  return end - start;
}

function remoteInsertBeginning(crdt, numberOfOperations) {
  const chars = generateChars(numberOfOperations);
  const descChars = chars.reverse();

  return remoteInsert(crdt, descChars);
}

function remoteDeleteBeginning(crdt) {
  const charsToDelete = [].concat.apply([], crdt.struct);
  return remoteDelete(crdt, charsToDelete);
}

function insertEnd(crdt, numberOfOperations) {
  let counter = 0;
  let line = 0;
  let ch;
  let pos;
  const start = Date.now();

  for (let i = 0; i < numberOfOperations; i++) {
    pos = { line, ch: counter };

    if (counter === 100) {
      crdt.handleLocalInsert('\n', pos);

      line++;
      counter = 0;
    } else {
      crdt.handleLocalInsert('a', pos);

      counter++;
    }
  }

  const end = Date.now();
  return end - start;
}

function deleteEnd(crdt) {
  const totalChars = crdt.totalChars();
  const start = Date.now();
  let line;
  let ch;
  let lineNum;

  for (let i = totalChars; i > 0; i--) {
    lineNum = crdt.struct.length - 1;
    line = crdt.struct[lineNum];
    ch = line[line.length - 1];
    const startPos = { line: lineNum, ch };
    const endPos = { line: lineNum, ch: ch + 1 };

    crdt.handleLocalDelete(startPos, endPos);
  }

  const end = Date.now();
  return end - start;
}

function remoteInsertEnd(crdt, numberOfOperations) {
  const ascChars = generateChars(numberOfOperations);

  return remoteInsert(crdt, ascChars);
}

function remoteDeleteEnd(crdt) {
  const charsToDelete = [].concat.apply([], crdt.struct);
  const reverseToDel = charsToDelete.reverse();
  return remoteDelete(crdt, reverseToDel);
}

function generateChars(numOps) {
  const crdts = [];
  let crdt;

  // Create crdts based on number of operations requested
  for (let i = 0; i < Math.log10(numOps); i++) {
    crdt = new CRDT(mockController());
    crdts.push(crdt);
  }

  // Insert characters randomly in each crdt
  const numOpsPerCRDT = numOps / crdts.length;
  crdts.forEach(crdt => insertRandom(crdt, numOpsPerCRDT));

  const chars = [];
  const structsWithLines = crdts.map(crdt => crdt.struct);
  const structs = structsWithLines.map(struct => [].concat.apply([], struct));

  for (let i = 0; i < structs[0].length; i++) {
    structs.forEach(struct => chars.push(struct[i]));
  }

  return chars;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function avgIdLength(crdt) {
  let numChars = 0;

  const idArray = crdt.struct.map(line =>
    line.map(char => char.position.map(id => id.digit).join('')),
  );
  const digitLengthSum = idArray.reduce(
    (acc, line) =>
      acc +
      line.reduce((acc, id) => {
        numChars++;
        return acc + id.length;
      }, 0),
    0,
  );

  return Math.floor(digitLengthSum / numChars);
}

function avgPosLength(crdt) {
  let numChars = 0;

  const posArray = crdt.struct.map(line => line.map(char => char.position.length));
  const posLengthSum = posArray.reduce(
    (acc, line) =>
      acc +
      line.reduce((acc, len) => {
        numChars++;
        return acc + len;
      }, 0),
    0,
  );

  return Math.floor(posLengthSum / numChars);
}

function average(time, operations) {
  return time / operations;
}

function addPadding(value, cellSize) {
  value = String(value);

  if (value.length > cellSize) {
    value = value.slice(0, cellSize);
  }

  const padding = (cellSize - value.length) / 2;
  return ' '.repeat(Math.floor(padding)) + value + ' '.repeat(Math.ceil(padding));
}

function addRowWithId(operations, crdt, func) {
  const totalTime = func(crdt, operations);
  const cell1 = addPadding(operations, CELL_1_SIZE);
  const cell2 = addPadding(totalTime, CELL_2_SIZE);
  const cell3 = addPadding(average(totalTime, operations), CELL_3_SIZE);
  const cell4 = addPadding(avgIdLength(crdt), CELL_4_SIZE);
  const cell5 = addPadding(avgPosLength(crdt), CELL_5_SIZE);

  return `|${cell1}|${cell2}|${cell3}|${cell4}|${cell5}|
${'-'.repeat(95)}`;
}

function addRow(operations, crdt, func) {
  const totalTime = func(crdt, operations);
  const cell1 = addPadding(operations, CELL_1_SIZE);
  const cell2 = addPadding(totalTime, CELL_2_SIZE);
  const cell3 = addPadding(average(totalTime, operations), CELL_3_SIZE);

  return `|${cell1}|${cell2}|${cell3}|
${'-'.repeat(62)}`;
}

function getTimestamp() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const date = now.getUTCDate();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

export {
  addRow,
  addRowWithId,
  insertRandom,
  remoteInsertRandom,
  insertEnd,
  remoteInsertEnd,
  insertBeginning,
  remoteInsertBeginning,
  deleteRandom,
  remoteDeleteRandom,
  deleteEnd,
  remoteDeleteEnd,
  deleteBeginning,
  remoteDeleteBeginning,
  getTimestamp,
};
