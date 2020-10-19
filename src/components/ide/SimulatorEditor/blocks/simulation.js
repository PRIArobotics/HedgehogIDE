// @flow

import * as React from 'react';

import { schema } from '../../Simulator/simulation';

import { anyAncestor, getInputDescendants } from './helpers';

export const SIMULATOR_ROOT = {
  blockJson: {
    type: 'simulator_root',
    message0: 'Simulation centered at (%1, %2) sized %3 x %4, with wall:  %5 %6 %7',
    args0: [
      {
        type: 'field_number',
        name: 'X',
        value: 0,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'Y',
        value: 0,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'W',
        value: 600,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'H',
        value: 400,
        precision: 1,
      },
      {
        type: 'field_checkbox',
        name: 'WALLS',
        checked: true,
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
    colour: 120,
    tooltip: 'Configuration for the whole simulation',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getInputDescendants,
    onchange() {
      const roots = this.workspace.getBlocksByType('simulator_root');
      this.setWarningText(roots.length >= 2 ? 'only one configuration root allowed' : null);
    },
    serialize(): schema.Simulation {
      const objectTypes = [
        'simulator_robot',
        'simulator_rect',
        'simulator_circle',
        'simulator_svg',
      ];

      function isRobotPart(object) {
        return anyAncestor(object, (ancestor) => ancestor.type === 'simulator_robot');
      }

      const x = this.getFieldValue('X');
      const y = this.getFieldValue('Y');
      const width = this.getFieldValue('W');
      const height = this.getFieldValue('H');

      let objects = this.getInputDescendants('OBJECTS')
        .filter((block) => objectTypes.includes(block.type) && !isRobotPart(block))
        .map((object) => object.serialize());

      if (this.getField('WALLS').getValueBoolean()) {
        const template = {
          type: 'rectangle',
          angle: 0,
          isStatic: true,
          render: {
            fillStyle: '#222222',
          },
        };
        objects = [
          {
            ...template,
            width,
            height: 10,
            position: {
              x: 0,
              y: -(height / 2 - 5),
            },
          },
          {
            ...template,
            width,
            height: 10,
            position: {
              x: 0,
              y: height / 2 - 5,
            },
          },
          {
            ...template,
            width: 10,
            height,
            position: {
              x: -(width / 2 - 5),
              y: 0,
            },
          },
          {
            ...template,
            width: 10,
            height,
            position: {
              x: width / 2 - 5,
              y: 0,
            },
          },
          ...objects,
        ];
      }

      return {
        center: { x, y },
        width,
        height,
        objects,
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_root" />,
  },
};

export default [SIMULATOR_ROOT];
