// @flow

import * as React from 'react';

import { schema } from '../../Simulator/simulation';

import { getInputDescendants, getSettings, collectSettings } from './helpers';

export const SIMULATOR_ROBOT = {
  blockJson: {
    type: 'simulator_robot',
    message0: 'Robot %1, with default sensors %2, with default grabber %3 %4 %5',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'hedgehog',
      },
      {
        type: 'field_checkbox',
        name: 'DEFAULT_SENSORS',
        checked: true,
      },
      {
        type: 'field_checkbox',
        name: 'DEFAULT_GRABBER',
        checked: false,
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
        'simulator_robot_part_servo_arm',
      ];

      let parts = this.getInputDescendants('PARTS')
        .filter((block) => objectTypes.includes(block.type))
        .map((object) => object.serialize());

      if (this.getField('DEFAULT_GRABBER').getValueBoolean()) {
        function servoArm(port: number, x: number, y: number, angle: number, label: string) {
          return {
            type: 'servo_arm',
            port,
            pivotAnchor: {
              x,
              y,
              angle,
            },
            pivotArm: {
              x: -17,
              y: 0,
              angle: 0,
            },
            length: 30,
            objects: [
              {
                type: 'rectangle',
                width: 35,
                height: 3,
                position: {
                  x: 0,
                  y: 0,
                },
                angle: 0,
                label,
              },
            ],
          };
        }

        parts = [
          servoArm(0, 27, -19, 0, 'leftServoArm'),
          servoArm(1, 27, 19, 0, 'leftServoArm'),
          ...parts,
        ];
      }

      if (this.getField('DEFAULT_SENSORS').getValueBoolean()) {
        function lineSensor(port: number, x: number, y: number, label: string) {
          return {
            type: 'line',
            port,
            objects: [
              {
                type: 'circle',
                radius: 2,
                angle: 0,
                position: { x, y },
                label,
              },
            ],
          };
        }

        function distanceSensor(port: number, x: number, y: number, angle: number, label: string) {
          return {
            type: 'distance',
            port,
            objects: [
              {
                type: 'rectangle',
                width: 3,
                height: 3,
                angle,
                position: { x, y },
                label,
              },
            ],
          };
        }

        function touchSensor(port: number, object: Object) {
          return {
            type: 'touch',
            port,
            objects: [object],
          };
        }

        const deg = Math.PI / 180;
        parts = [
          lineSensor(0, 22, -22, 'leftLineSensor'),
          lineSensor(1, 22, -8, 'centerLeftLineSensor'),
          lineSensor(2, 22, 8, 'centerRightLineSensor'),
          lineSensor(3, 22, 22, 'rightLineSensor'),
          distanceSensor(4, 20, -14, -60 * deg, 'leftDistanceSensor'),
          distanceSensor(5, 20, 0, 0 * deg, 'centerDistanceSensor'),
          distanceSensor(6, 20, 14, 60 * deg, 'rightDistanceSensor'),
          touchSensor(8, {
            type: 'rectangle',
            width: 3,
            height: 32,
            angle: 0,
            position: {
              x: 24,
              y: 0,
            },
            label: 'frontTouchSensor',
          }),
          ...parts,
        ];
      }

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

export const SIMULATOR_ROBOT_PART_SERVO_ARM = {
  blockJson: {
    type: 'simulator_robot_part_servo_arm',
    message0:
      'Servo Arm %1 %2 Anchor pivot at (%3, %4) %5° %6 Arm pivot at (%7, %8) %9° %10 Control point distance %11 %12 %13',
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
        type: 'field_number',
        name: 'ANCHOR_X',
        value: 0,
      },
      {
        type: 'field_number',
        name: 'ANCHOR_Y',
        value: 0,
      },
      {
        type: 'field_angle',
        name: 'ANCHOR_ANGLE',
        value: 0,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'field_number',
        name: 'ARM_X',
        value: 0,
      },
      {
        type: 'field_number',
        name: 'ARM_Y',
        value: 0,
      },
      {
        type: 'field_angle',
        name: 'ARM_ANGLE',
        value: 0,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'field_number',
        name: 'CONTROL_LENGTH',
        value: 30,
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
    tooltip: 'simulated servo arm',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getInputDescendants,
    getFields() {
      return {
        type: 'servo_arm',
        port: this.getFieldValue('PORT'),
        pivotAnchor: {
          x: this.getFieldValue('ANCHOR_X'),
          y: this.getFieldValue('ANCHOR_Y'),
          angle: -(this.getFieldValue('ANCHOR_ANGLE') / 180) * Math.PI,
        },
        pivotArm: {
          x: this.getFieldValue('ARM_X'),
          y: this.getFieldValue('ARM_Y'),
          angle: -(this.getFieldValue('ARM_ANGLE') / 180) * Math.PI,
        },
        length: this.getFieldValue('CONTROL_LENGTH'),
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
      <block type="simulator_robot_part_servo_arm">
        <value name="OBJECTS">
          <block type="simulator_rect">
            <field name="W">35</field>
            <field name="H">3</field>
            <value name="SETTINGS">
              <block type="simulator_settings_label">
                <field name="LABEL">servoArm</field>
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
  SIMULATOR_ROBOT_PART_SERVO_ARM,
];
