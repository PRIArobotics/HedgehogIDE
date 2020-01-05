// @flow

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '.';

const AnalogBlock: Block = {
  blockJson: {
    type: 'analog_block',
    message0: 'get analog value of sensor %1',
    args0: [
      {
        type: 'input_value',
        name: 'PORT',
        check: 'Number',
      },
    ],
    output: 'Number',
    inputsInline: true,
    colour: 120,
    tooltip: 'This is a tooltip',
    helpUrl: '',
  },
  generators: {
    JavaScript: block => {
      const valuePort = Blockly.JavaScript.valueToCode(
        block,
        'PORT',
        Blockly.JavaScript.ORDER_NONE,
      );
      const code = `await getAnalog(${valuePort})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="analog_block">
        <value name="PORT">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
    ),
  },
};

export default AnalogBlock;
