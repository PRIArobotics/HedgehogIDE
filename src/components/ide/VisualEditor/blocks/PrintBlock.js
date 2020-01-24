// @flow

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '.';

const PrintBlock: Block = {
  blockJson: {
    type: 'print_block',
    message0: 'output %1',
    args0: [
      {
        type: 'input_value',
        name: 'TEXT',
        check: ['Number', 'String'],
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 70,
    tooltip: 'This is a tooltip',
    helpUrl: '',
  },
  generators: {
    JavaScript: block => {
      const valueText = Blockly.JavaScript.valueToCode(
        block,
        'TEXT',
        Blockly.JavaScript.ORDER_NONE,
      );
      return `print(${valueText});\n`;
    },
    Python: block => {
      const valueText = Blockly.Python.valueToCode(
        block,
        'TEXT',
        Blockly.Python.ORDER_NONE,
      );
      return `print(${valueText});\n`;
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="print_block">
        <value name="TEXT">
          <shadow type="text" />
        </value>
      </block>
    ),
  },
};

export default PrintBlock;
