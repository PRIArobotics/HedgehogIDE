// @flow

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '.';

const SleepBlock: Block = {
  blockJson: {
    type: 'sleep_block',
    message0: 'sleep %1',
    args0: [
      {
        type: 'input_value',
        name: 'TIME',
        check: 'Number',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '',
    helpUrl: '',
  },
  generators: {
    JavaScript: block => {
      const valueTime = Blockly.JavaScript.valueToCode(
        block,
        'TIME',
        Blockly.JavaScript.ORDER_NONE,
      );
      return `await sleep(${valueTime});\n`;
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="sleep_block">
        <value name="TIME">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
      </block>
    ),
  },
};

export default SleepBlock;
