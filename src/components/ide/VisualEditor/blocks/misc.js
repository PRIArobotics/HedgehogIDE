// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly/core';

import { type Block, registerBlocklyBlock } from '.';

export const PRINT_BLOCK: Block = {
  blockJson: {
    type: 'print_block',
    message0: '%{BKY_PRINT_BLOCK}',
    args0: [
      {
        "type": "input_value",
        "name": "TEXT",
        "check": [
          "Number",
          "Boolean",
          "String"
        ]
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 70,
    tooltip: '%{BKY_PRINT_BLOCK_TOOLTIP}',
    helpUrl: '/help#blockly-misc',
  },
  generators: {
    JavaScript: block => {
      // <GSL customizable: print_block-body-JavaScript>
      const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE);
      const code = `print(${text});\n`;
      return code;
      // </GSL customizable: print_block-body-JavaScript>
    },
    Python: block => {
      // <GSL customizable: print_block-body-Python>
      const text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_NONE);
      const code = `print(${text})\n`;
      return code;
      // </GSL customizable: print_block-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="print_block">
        {/* <GSL customizable: print_block-default-toolbox> */}
        <value name="TEXT">
          <shadow type="text" />
        </value>
        {/* </GSL customizable: print_block-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: print_block-extra-toolbox />
  },
};

export const GET_INPUT_BLOCK: Block = {
  blockJson: {
    type: 'get_input_block',
    message0: '%{BKY_GET_INPUT_BLOCK}',
    args0: [],
    output: 'String',
    colour: 70,
    tooltip: '%{BKY_GET_INPUT_BLOCK_TOOLTIP}',
    helpUrl: '/help#blockly-misc',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      // <default GSL customizable: get_input_block-body-JavaScript>
      // TODO generate code
      const code = 'await sdk.misc.getInput()';
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: get_input_block-body-JavaScript>
    },
    Python: block => {
      // <GSL customizable: get_input_block-body-Python>
      // TODO generate code
      const code = 'input()';
      return [code, Blockly.Python.ORDER_NONE];
      // </GSL customizable: get_input_block-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="get_input_block">
        {/* <default GSL customizable: get_input_block-default-toolbox> */}
        {/* </GSL customizable: get_input_block-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: get_input_block-extra-toolbox />
  },
};

const blocks = [
  PRINT_BLOCK,
  GET_INPUT_BLOCK,
];

blocks.forEach(registerBlocklyBlock);

export default blocks;
