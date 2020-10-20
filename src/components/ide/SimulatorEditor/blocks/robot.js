// @flow

import * as React from 'react';

import { schema } from '../../Simulator/simulation';

import { getInputDescendants, getSettings, collectSettings } from './helpers';

export const SIMULATOR_ROBOT = {
  blockJson: {
    type: 'simulator_robot',
    message0: 'Robot "%1" %2 %3',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'hedgehog',
      },
      {
        type: 'input_value',
        name: 'SETTINGS',
        check: 'SimulatorObjectSettings',
      },
      {
        type: 'input_statement',
        name: 'PARTS',
        align: 'RIGHT',
        check: 'SimulatorRobotPart',
      },
    ],
    previousStatement: 'SimulatorObject',
    nextStatement: 'SimulatorObject',
    colour: 90,
    tooltip: 'simulated robot',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getInputDescendants,
    getFields() {
      return {
        type: 'robot',
        name: this.getFieldValue('NAME'),
      };
    },
    getSettings,
    serialize(): schema.Robot {
      const objectTypes = [
        'simulator_robot_part_line',
        'simulator_robot_part_touch',
        'simulator_robot_part_distance',
      ];

      const parts = this.getInputDescendants('PARTS')
        .filter((block) => objectTypes.includes(block.type))
        .map((object) => object.serialize());

      const {
        static: _static,
        sensor: _sensor,
        density: _density,
        frictionAir: _frictionAir,
        ...settings
      } = collectSettings(this);

      return {
        ...this.getFields(),
        ...settings,
        parts,
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_robot" />,
  },
};

export const SIMULATOR_ROBOT_PART_LINE = {
  blockJson: {
    type: 'simulator_robot_part_line',
    message0: 'Line Sensor %1 %2 %3',
    args0: [
      {
        type: 'field_number',
        name: 'PORT',
        value: 0,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'OBJECTS',
        align: 'RIGHT',
        check: 'SimulatorObject',
      },
    ],
    previousStatement: 'SimulatorRobotPart',
    nextStatement: 'SimulatorRobotPart',
    colour: 90,
    tooltip: 'simulated line (reflectance) sensor',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getInputDescendants,
    getFields() {
      return {
        type: 'line',
        port: this.getFieldValue('PORT'),
      };
    },
    serialize(): schema.TouchSensor {
      const objectTypes = ['simulator_rect', 'simulator_circle', 'simulator_svg'];

      const objects = this.getInputDescendants('OBJECTS')
        .filter((block) => objectTypes.includes(block.type))
        .map((object) => object.serialize());

      return {
        ...this.getFields(),
        objects,
      };
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="simulator_robot_part_line">
        <value name="OBJECTS">
          <block type="simulator_circle">
            <field name="R">2</field>
            <value name="SETTINGS">
              <block type="simulator_settings_translate">
                <value name="MORE">
                  <block type="simulator_settings_label">
                    <field name="LABEL">lineSensor</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </value>
      </block>
    ),
  },
};

export const SIMULATOR_ROBOT_PART_TOUCH = {
  blockJson: {
    type: 'simulator_robot_part_touch',
    message0: 'Touch Sensor %1 %2 %3',
    args0: [
      {
        type: 'field_number',
        name: 'PORT',
        value: 0,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'OBJECTS',
        align: 'RIGHT',
        check: 'SimulatorObject',
      },
    ],
    previousStatement: 'SimulatorRobotPart',
    nextStatement: 'SimulatorRobotPart',
    colour: 90,
    tooltip: 'simulated touch sensor',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getInputDescendants,
    getFields() {
      return {
        type: 'touch',
        port: this.getFieldValue('PORT'),
      };
    },
    serialize(): schema.TouchSensor {
      const objectTypes = ['simulator_rect', 'simulator_circle', 'simulator_svg'];

      const objects = this.getInputDescendants('OBJECTS')
        .filter((block) => objectTypes.includes(block.type))
        .map((object) => object.serialize());

      return {
        ...this.getFields(),
        objects,
      };
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="simulator_robot_part_touch">
        <value name="OBJECTS">
          <block type="simulator_rect">
            <field name="W">3</field>
            <field name="H">32</field>
            <value name="SETTINGS">
              <block type="simulator_settings_translate">
                <value name="MORE">
                  <block type="simulator_settings_label">
                    <field name="LABEL">touchSensor</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </value>
      </block>
    ),
  },
};

export const SIMULATOR_ROBOT_PART_DISTANCE = {
  blockJson: {
    type: 'simulator_robot_part_distance',
    message0: 'Distance Sensor %1 %2 %3',
    args0: [
      {
        type: 'field_number',
        name: 'PORT',
        value: 0,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'OBJECTS',
        align: 'RIGHT',
        check: 'SimulatorObject',
      },
    ],
    previousStatement: 'SimulatorRobotPart',
    nextStatement: 'SimulatorRobotPart',
    colour: 90,
    tooltip: 'simulated (infrared triangulation) distance sensor',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getInputDescendants,
    getFields() {
      return {
        type: 'distance',
        port: this.getFieldValue('PORT'),
      };
    },
    serialize(): schema.TouchSensor {
      const objectTypes = ['simulator_rect', 'simulator_circle', 'simulator_svg'];

      const objects = this.getInputDescendants('OBJECTS')
        .filter((block) => objectTypes.includes(block.type))
        .map((object) => object.serialize());

      return {
        ...this.getFields(),
        objects,
      };
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="simulator_robot_part_distance">
        <value name="OBJECTS">
          <block type="simulator_rect">
            <field name="W">3</field>
            <field name="H">3</field>
            <value name="SETTINGS">
              <block type="simulator_settings_translate">
                <value name="MORE">
                  <block type="simulator_settings_rotate">
                    <value name="MORE">
                      <block type="simulator_settings_label">
                        <field name="LABEL">distanceSensor</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </value>
      </block>
    ),
  },
};

export default [
  SIMULATOR_ROBOT,
  SIMULATOR_ROBOT_PART_LINE,
  SIMULATOR_ROBOT_PART_TOUCH,
  SIMULATOR_ROBOT_PART_DISTANCE,
];
