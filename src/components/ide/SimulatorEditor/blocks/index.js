// @flow

import Blockly from 'blockly/core';

import simulationBlocks from './simulation';
import settingsBlocks from './settings';
import objectBlocks from './objects';
import robotBlocks from './robot';

export * from './simulation';
export * from './settings';
export * from './objects';
export * from './robot';

const blocks = [...simulationBlocks, ...settingsBlocks, ...objectBlocks, ...robotBlocks];

blocks.forEach((block) => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
    ...block.blockExtras,
  };
});

export default blocks;
