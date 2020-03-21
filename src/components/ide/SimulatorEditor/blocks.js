// @flow

import * as React from 'react';

export const SIMULATOR_ROOT = {
  blockJson: {
    type: 'simulator_root',
    message0: 'Simulation settings: %1 Objects %2 Lines %3 Robots %4',
    args0: [
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'OBJECTS',
        align: 'RIGHT',
      },
      {
        type: 'input_statement',
        name: 'LINES',
        align: 'RIGHT',
      },
      {
        type: 'input_statement',
        name: 'ROBOTS',
        align: 'RIGHT',
      },
    ],
    colour: 120,
    tooltip: 'Liste aller Objekte in der Simulation',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_root" />,
  },
};

export const SIMULATOR_SHAPE = {
  blockJson: {
    type: 'simulator_shape',
    message0: '%1 %2 center (%3, %4) %5 dimension (%6, %7) %8 color %9',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SHAPE',
        value: 'RECT',
        options: [['rectangle', 'RECT'], ['ellipse', 'ELLIPSE']],
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'field_number',
        name: 'CX',
        value: 0,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'CY',
        value: 0,
        precision: 1,
      },
      {
        type: 'input_dummy',
        align: 'RIGHT',
      },
      {
        type: 'field_number',
        name: 'W',
        value: 0,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'H',
        value: 0,
        precision: 1,
      },
      {
        type: 'input_dummy',
        align: 'RIGHT',
      },
      {
        type: 'input_value',
        name: 'COLOUR',
        align: 'RIGHT',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'Liste aller Objekte in der Simulation',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    rect: () => <block type="simulator_shape" />,
    ellipse: () => (
      <block type="simulator_shape">
        <field name="SHAPE">ELLIPSE</field>
      </block>
    ),
  },
};
