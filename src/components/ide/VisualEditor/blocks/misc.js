// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '.';

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
          "String"
        ]
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 70,
    tooltip: '%{BKY_PRINT_BLOCK_TOOLTIP}',
    helpUrl: 'TODO',
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
