// @flow

import * as React from 'react';
import Blockly from 'blockly/core';

export type Block = {|
  blockJson: Object,
  generators: { [string]: (Object) => string | [string, number] },
  toolboxBlocks: { [string]: () => React.Node },
|};

export function registerBlocklyBlock(block: Block) {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
  };
  Blockly.JavaScript[type] = block.generators.JavaScript;
  Blockly.Python[type] = block.generators.Python;
}
