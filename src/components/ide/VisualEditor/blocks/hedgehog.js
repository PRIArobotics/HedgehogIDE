// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly/core';

import { type Block } from '.';

export const HEDGEHOG_MOVE: Block = {
  blockJson: {
    type: 'hedgehog_move',
    message0: '%{BKY_HEDGEHOG_MOVE}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 3,
        "precision": 1
      },
      {
        "type": "input_value",
        "name": "SPEED",
        "check": "Number"
      },
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
    tooltip: '%{BKY_HEDGEHOG_MOVE_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_move-body-JavaScript>
      const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_NONE);
      const time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_NONE);
      let code = '';
      code += `await hedgehog.moveMotor(${port}, ${speed});\n`;
      code += `await sleep(${time} * 1000);\n`;
      code += `await hedgehog.moveMotor(${port}, 0);\n`;
      return code;
      // </GSL customizable: hedgehog_move-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_move-body-Python>
      const speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
      const time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);
      // TODO import sleep
      let code = '';
      code += `hedgehog.move_motor(${port}, ${speed})\n`;
      code += `sleep(${time})\n`;
      code += `hedgehog.brake(${port})\n`;
        return code;
      // </GSL customizable: hedgehog_move-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_move">
        {/* <GSL customizable: hedgehog_move-default-toolbox> */}
        <value name="SPEED">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
        <value name="TIME">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_move-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_move-extra-toolbox />
  },
};

export const HEDGEHOG_MOVE_UNLIMITED: Block = {
  blockJson: {
    type: 'hedgehog_move_unlimited',
    message0: '%{BKY_HEDGEHOG_MOVE_UNLIMITED}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 3,
        "precision": 1
      },
      {
        "type": "input_value",
        "name": "SPEED",
        "check": "Number"
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_MOVE_UNLIMITED_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_move_unlimited-body-JavaScript>
      const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_NONE);
      const code = `await hedgehog.moveMotor(${port}, ${speed});\n`;
      return code;
      // </GSL customizable: hedgehog_move_unlimited-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_move_unlimited-body-Python>
      const speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
      const code = `hedgehog.move_motor(${port}, ${speed})\n`;
      return code;
      // </GSL customizable: hedgehog_move_unlimited-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_move_unlimited">
        {/* <GSL customizable: hedgehog_move_unlimited-default-toolbox> */}
        <value name="SPEED">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_move_unlimited-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_move_unlimited-extra-toolbox />
  },
};

export const HEDGEHOG_MOTOR_OFF: Block = {
  blockJson: {
    type: 'hedgehog_motor_off',
    message0: '%{BKY_HEDGEHOG_MOTOR_OFF}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 3,
        "precision": 1
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_MOTOR_OFF_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_motor_off-body-JavaScript>
      const code = `await hedgehog.moveMotor(${port}, 0);\n`;
      return code;
      // </GSL customizable: hedgehog_motor_off-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_motor_off-body-Python>
      const code = `hedgehog.motor_off(${port})\n`;
      return code;
      // </GSL customizable: hedgehog_motor_off-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_motor_off">
        {/* <default GSL customizable: hedgehog_motor_off-default-toolbox> */}
        {/* </GSL customizable: hedgehog_motor_off-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_motor_off-extra-toolbox />
  },
};

export const HEDGEHOG_BRAKE: Block = {
  blockJson: {
    type: 'hedgehog_brake',
    message0: '%{BKY_HEDGEHOG_BRAKE}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 3,
        "precision": 1
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_BRAKE_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_brake-body-JavaScript>
      const code = `await hedgehog.moveMotor(${port}, 0);\n`;
      return code;
      // </GSL customizable: hedgehog_brake-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_brake-body-Python>
      const code = `hedgehog.brake(${port})\n`;
      return code;
      // </GSL customizable: hedgehog_brake-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_brake">
        {/* <default GSL customizable: hedgehog_brake-default-toolbox> */}
        {/* </GSL customizable: hedgehog_brake-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_brake-extra-toolbox />
  },
};

export const HEDGEHOG_MOVE2: Block = {
  blockJson: {
    type: 'hedgehog_move2',
    message0: '%{BKY_HEDGEHOG_MOVE2}',
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
      },
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
    tooltip: '%{BKY_HEDGEHOG_MOVE2_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_move2-body-JavaScript>
      const speed1 = Blockly.JavaScript.valueToCode(block, 'SPEED1', Blockly.JavaScript.ORDER_NONE);
      const speed2 = Blockly.JavaScript.valueToCode(block, 'SPEED2', Blockly.JavaScript.ORDER_NONE);
      const time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_NONE);
      const indent = Blockly.JavaScript.INDENT;
      let code = '';
      code += 'await hedgehog.commands(\n';
      code += `${indent}Hedgehog.moveMotorCmd(${port1}, ${speed1}),\n`;
      code += `${indent}Hedgehog.moveMotorCmd(${port2}, ${speed2}),\n`;
      code += ');\n';
      code += `await sleep(${time} * 1000);\n`;
      code += 'await hedgehog.commands(\n';
      code += `${indent}Hedgehog.moveMotorCmd(${port1}, 0),\n`;
      code += `${indent}Hedgehog.moveMotorCmd(${port2}, 0),\n`;
      code += ');\n';
      return code;
      // </GSL customizable: hedgehog_move2-body-JavaScript>
    },
    Python: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_move2-body-Python>
      const speed1 = Blockly.Python.valueToCode(block, 'SPEED1', Blockly.Python.ORDER_NONE);
      const speed2 = Blockly.Python.valueToCode(block, 'SPEED2', Blockly.Python.ORDER_NONE);
      const time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);
      const indent = Blockly.Python.INDENT;
      let code = '';
      code += 'hedgehog.commands(\n';
      code += `${indent}hedgehog.move_motor_cmd(${port1}, ${speed1}),\n`;
      code += `${indent}hedgehog.move_motor_cmd(${port2}, ${speed2}),\n`;
      code += ')\n';
      code += `sleep(${time})\n`;
      code += 'hedgehog.commands(\n';
      code += `${indent}hedgehog.brake_cmd(${port1}),\n`;
      code += `${indent}hedgehog.brake_cmd(${port2}),\n`;
      code += ')\n';
      return code;
      // </GSL customizable: hedgehog_move2-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_move2">
        {/* <GSL customizable: hedgehog_move2-default-toolbox> */}
        <value name="SPEED1">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
        <value name="SPEED2">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
        <value name="TIME">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_move2-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_move2-extra-toolbox />
  },
};

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
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_move2_unlimited-body-JavaScript>
      const speed1 = Blockly.JavaScript.valueToCode(block, 'SPEED1', Blockly.JavaScript.ORDER_NONE);
      const speed2 = Blockly.JavaScript.valueToCode(block, 'SPEED2', Blockly.JavaScript.ORDER_NONE);
      const indent = Blockly.JavaScript.INDENT;
      let code = '';
      code += 'await commands(\n';
      code += `${indent}hedgehog.moveMotor(${port1}, ${speed1}),\n`;
      code += `${indent}hedgehog.moveMotor(${port2}, ${speed2}),\n`;
      code += ');\n';
      return code;
      // </GSL customizable: hedgehog_move2_unlimited-body-JavaScript>
    },
    Python: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_move2_unlimited-body-Python>
      const speed1 = Blockly.Python.valueToCode(block, 'SPEED1', Blockly.Python.ORDER_NONE);
      const speed2 = Blockly.Python.valueToCode(block, 'SPEED2', Blockly.Python.ORDER_NONE);
      const indent = Blockly.Python.INDENT;
      let code = '';
      code += 'hedgehog.commands(\n';
      code += `${indent}hedgehog.move_motor_cmd(${port1}, ${speed1}),\n`;
      code += `${indent}hedgehog.move_motor_cmd(${port2}, ${speed2}),\n`;
      code += ')\n';
      return code;
      // </GSL customizable: hedgehog_move2_unlimited-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_move2_unlimited">
        {/* <GSL customizable: hedgehog_move2_unlimited-default-toolbox> */}
        <value name="SPEED1">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
        <value name="SPEED2">
          <shadow type="math_number">
            <field name="NUM">1000</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_move2_unlimited-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_move2_unlimited-extra-toolbox />
  },
};

export const HEDGEHOG_MOTOR_OFF2: Block = {
  blockJson: {
    type: 'hedgehog_motor_off2',
    message0: '%{BKY_HEDGEHOG_MOTOR_OFF2}',
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
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_MOTOR_OFF2_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_motor_off2-body-JavaScript>
      const indent = Blockly.JavaScript.INDENT;
      let code = '';
      code += 'await commands(\n';
      code += `${indent}hedgehog.moveMotor(${port1}, 0),\n`;
      code += `${indent}hedgehog.moveMotor(${port2}, 0),\n`;
      code += ');\n';
      return code;
      // </GSL customizable: hedgehog_motor_off2-body-JavaScript>
    },
    Python: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_motor_off2-body-Python>
      const indent = Blockly.Python.INDENT;
      let code = '';
      code += 'hedgehog.commands(\n';
      code += `${indent}hedgehog.motor_off_cmd(${port1}),\n`;
      code += `${indent}hedgehog.motor_off_cmd(${port2}),\n`;
      code += ')\n';
      return code;
      // </GSL customizable: hedgehog_motor_off2-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_motor_off2">
        {/* <default GSL customizable: hedgehog_motor_off2-default-toolbox> */}
        {/* </GSL customizable: hedgehog_motor_off2-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_motor_off2-extra-toolbox />
  },
};

export const HEDGEHOG_BRAKE2: Block = {
  blockJson: {
    type: 'hedgehog_brake2',
    message0: '%{BKY_HEDGEHOG_BRAKE2}',
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
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_BRAKE2_TOOLTIP}',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_brake2-body-JavaScript>
      const indent = Blockly.JavaScript.INDENT;
      let code = '';
      code += 'await commands(\n';
      code += `${indent}hedgehog.moveMotor(${port1}, 0),\n`;
      code += `${indent}hedgehog.moveMotor(${port2}, 0),\n`;
      code += ');\n';
      return code;
      // </GSL customizable: hedgehog_brake2-body-JavaScript>
    },
    Python: block => {
      const port1 = block.getFieldValue('PORT1');
      const port2 = block.getFieldValue('PORT2');
      // <GSL customizable: hedgehog_brake2-body-Python>
      const indent = Blockly.Python.INDENT;
      let code = '';
      code += 'hedgehog.commands(\n';
      code += `${indent}hedgehog.brake_cmd(${port1}),\n`;
      code += `${indent}hedgehog.brake_cmd(${port2}),\n`;
      code += ')\n';
      return code;
      // </GSL customizable: hedgehog_brake2-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_brake2">
        {/* <default GSL customizable: hedgehog_brake2-default-toolbox> */}
        {/* </GSL customizable: hedgehog_brake2-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_brake2-extra-toolbox />
  },
};

export const HEDGEHOG_SERVO: Block = {
  blockJson: {
    type: 'hedgehog_servo',
    message0: '%{BKY_HEDGEHOG_SERVO}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 5,
        "precision": 1
      },
      {
        "type": "input_value",
        "name": "ANGLE",
        "check": "Number"
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_SERVO_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_servo-body-JavaScript>
      const angle = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_MULTIPLICATION);
      const code = `await hedgehog.setServo(${port}, Math.round(${angle} * 1000 / 180));\n`;
      return code;
      // </GSL customizable: hedgehog_servo-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_servo-body-Python>
      const angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_MULTIPLICATIVE);
      let code = '';
      code += `hedgehog.set_servo(${port}, int(${angle} * 1000 / 180))\n`;
      code += 'sleep(0.1)\n';
        return code;
      // </GSL customizable: hedgehog_servo-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_servo">
        {/* <GSL customizable: hedgehog_servo-default-toolbox> */}
        <value name="ANGLE">
          <shadow type="math_number">
            <field name="NUM">90</field>
          </shadow>
        </value>
        {/* </GSL customizable: hedgehog_servo-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_servo-extra-toolbox />
  },
};

export const HEDGEHOG_SERVO_OFF: Block = {
  blockJson: {
    type: 'hedgehog_servo_off',
    message0: '%{BKY_HEDGEHOG_SERVO_OFF}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 5,
        "precision": 1
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_SERVO_OFF_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_servo_off-body-JavaScript>
      const code = `await hedgehog.setServo(${port}, null);\n`;
      return code;
      // </GSL customizable: hedgehog_servo_off-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_servo_off-body-Python>
      const code = `hedgehog.set_servo(${port}, None)\n`;
      return code;
      // </GSL customizable: hedgehog_servo_off-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_servo_off">
        {/* <default GSL customizable: hedgehog_servo_off-default-toolbox> */}
        {/* </GSL customizable: hedgehog_servo_off-default-toolbox> */}
      </block>
    ),
    // <default GSL customizable: hedgehog_servo_off-extra-toolbox />
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
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_analog-body-JavaScript>
      const code = `await hedgehog.getAnalog(${port})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: hedgehog_read_analog-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_analog-body-Python>
      const code = `hedgehog.get_analog(${port})`;
      return [code, Blockly.Python.ORDER_MEMBER];
      // </GSL customizable: hedgehog_read_analog-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_read_analog">
        {/* <default GSL customizable: hedgehog_read_analog-default-toolbox> */}
        {/* </GSL customizable: hedgehog_read_analog-default-toolbox> */}
      </block>
    ),
    // <GSL customizable: hedgehog_read_analog-extra-toolbox>
    comparison: () => (
      <block type="logic_compare">
        <field name="OP">GT</field>
        <value name="A">
          <block type="hedgehog_read_analog" />
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">2047</field>
          </shadow>
        </value>
      </block>
    ),
    // </GSL customizable: hedgehog_read_analog-extra-toolbox>
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
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_digital-body-JavaScript>
      // TODO generate code
      const code = `await hedgehog.getDigital(${port})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: hedgehog_read_digital-body-JavaScript>
    },
    Python: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_digital-body-Python>
      const code = `hedgehog.get_digital(${port})`;
      return [code, Blockly.Python.ORDER_MEMBER];
      // </GSL customizable: hedgehog_read_digital-body-Python>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_read_digital">
        {/* <default GSL customizable: hedgehog_read_digital-default-toolbox> */}
        {/* </GSL customizable: hedgehog_read_digital-default-toolbox> */}
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
    extensions: ['requires_async_js_function'],
  },
  generators: {
    JavaScript: block => {
      // <GSL customizable: hedgehog_sleep-body-JavaScript>
      const time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_MULTIPLICATION);
      const code = `await sleep(${time} * 1000);\n`;
      return code;
      // </GSL customizable: hedgehog_sleep-body-JavaScript>
    },
    Python: block => {
      // <GSL customizable: hedgehog_sleep-body-Python>
      const time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);
      const code = `sleep(${time})\n`;
      return code;
      // </GSL customizable: hedgehog_sleep-body-Python>
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

const blocks = [
  HEDGEHOG_MOVE,
  HEDGEHOG_MOVE_UNLIMITED,
  HEDGEHOG_MOTOR_OFF,
  HEDGEHOG_BRAKE,
  HEDGEHOG_MOVE2,
  HEDGEHOG_MOVE2_UNLIMITED,
  HEDGEHOG_MOTOR_OFF2,
  HEDGEHOG_BRAKE2,
  HEDGEHOG_SERVO,
  HEDGEHOG_SERVO_OFF,
  HEDGEHOG_READ_ANALOG,
  HEDGEHOG_READ_DIGITAL,
  HEDGEHOG_SLEEP,
];

blocks.forEach(block => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
  };
  Blockly.JavaScript[type] = block.generators.JavaScript;
  Blockly.Python[type] = block.generators.Python;
});

export default blocks;
