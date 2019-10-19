// @flow

import React from 'react';
import Blockly from 'blockly';

import { Block } from '.';

const MoveBlock: Block = {
  blockJson: {
    type: 'move_block',
    message0: 'move with power %1 and %2',
    args0: [
      {
        type: 'input_value',
        name: 'LEFT',
        check: 'Number',
      },
      {
        type: 'input_value',
        name: 'RIGHT',
        check: 'Number',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'This is a tooltip',
    helpUrl: '',
  },
  generators: {
    JavaScript: block => {
      const valueLeft = Blockly.JavaScript.valueToCode(
        block,
        'LEFT',
        Blockly.JavaScript.ORDER_NONE,
      );
      const valueRight = Blockly.JavaScript.valueToCode(
        block,
        'RIGHT',
        Blockly.JavaScript.ORDER_NONE,
      );
      return `move(${valueLeft}, ${valueRight});\n`;
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="move_block">
        <value name="LEFT">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
        <value name="RIGHT">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
    ),
  },
};

export default MoveBlock;
