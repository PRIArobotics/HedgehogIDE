// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '.';

export const HEDGEHOG_MOVE2_UNLIMITED: Block = {
  blockJson: {
    type: 'hedgehog_move2_unlimited',
    message0: '%{BKY_HEDGEHOG_MOVE2_UNLIMITED}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT1",
        "value": 0,
        "min": 0,
        "max": 3,
        "precision": 1
      },
      {
        "type": "field_number",
        "name": "PORT2",
        "value": 1,
        "min": 0,
        "max": 3,
        "precision": 1
      },
      {
        "type": "input_value",
        "name": "SPEED1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "SPEED2",
        "check": "Number"
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_MOVE2_UNLIMITED_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_move2_unlimited-body>
      const speed1 = Blockly.JavaScript.valueToCode(block, 'SPEED1', Blockly.JavaScript.ORDER_NONE);
      const speed2 = Blockly.JavaScript.valueToCode(block, 'SPEED2', Blockly.JavaScript.ORDER_NONE);
      let code = '';
      code += `await moveMotor(${port1}, ${speed1});\n`;
      code += `await moveMotor(${port2}, ${speed2});\n`;
      return code;
      // </GSL customizable: hedgehog_move2_unlimited-body>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_move2_unlimited">
        {/* <GSL customizable: hedgehog_move2_unlimited-default-toolbox> */}
        <value name="SPEED1">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
        <value name="SPEED2">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_move2_unlimited-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_move2_unlimited-extra-toolbox />
  },
};

export const HEDGEHOG_READ_ANALOG: Block = {
  blockJson: {
    type: 'hedgehog_read_analog',
    message0: '%{BKY_HEDGEHOG_READ_ANALOG}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 15,
        "precision": 1
      }
    ],
    output: 'Number',
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_READ_ANALOG_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_analog-body>
      const code = `await getAnalog(${port})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: hedgehog_read_analog-body>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_read_analog">
        {/* <default GSL customizable: hedgehog_read_analog-default-toolbox /> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_read_analog-extra-toolbox />
  },
};

export const HEDGEHOG_READ_DIGITAL: Block = {
  blockJson: {
    type: 'hedgehog_read_digital',
    message0: '%{BKY_HEDGEHOG_READ_DIGITAL}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 15,
        "precision": 1
      }
    ],
    output: 'Boolean',
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_READ_DIGITAL_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_digital-body>
      // TODO generate code
      const code = `await getDigital(${port})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: hedgehog_read_digital-body>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_read_digital">
        {/* <default GSL customizable: hedgehog_read_digital-default-toolbox /> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_read_digital-extra-toolbox />
  },
};

export const HEDGEHOG_SLEEP: Block = {
  blockJson: {
    type: 'hedgehog_sleep',
    message0: '%{BKY_HEDGEHOG_SLEEP}',
    args0: [
      {
        "type": "input_value",
        "name": "TIME",
        "check": "Number"
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_SLEEP_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      // <GSL customizable: hedgehog_sleep-body>
      const time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_MULTIPLICATION);
      const code = `await sleep(${time} * 1000);\n`;
      return code;
      // </GSL customizable: hedgehog_sleep-body>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_sleep">
        {/* <GSL customizable: hedgehog_sleep-default-toolbox> */}
        <value name="TIME">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_sleep-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_sleep-extra-toolbox />
  },
};
