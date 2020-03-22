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
        check: 'Shape',
      },
      {
        type: 'input_statement',
        name: 'LINES',
        align: 'RIGHT',
        check: 'Shape',
      },
      {
        type: 'input_statement',
        name: 'ROBOTS',
        align: 'RIGHT',
        check: 'Robot',
      },
    ],
    colour: 120,
    tooltip: 'List of all objects in the simulation',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_root" />,
  },
};

export const SIMULATOR_SHAPE = {
  blockJson: {
    type: 'simulator_shape',
    message0: '%1 with bounding box %2 fixed: %3, color: %4 %5',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SHAPE',
        value: 'RECT',
        options: [['rectangle', 'RECT'], ['ellipse', 'ELLIPSE']],
      },
      {
        type: 'input_value',
        name: 'BOUNDING_BOX',
        align: 'RIGHT',
        check: 'BoundingBox',
      },
      {
        type: 'field_checkbox',
        name: 'STATIC',
        checked: false,
      },
      {
        type: 'field_colour',
        name: 'COLOUR',
        colour: '#222222'
      },
      {
        type: 'input_dummy',
        align: 'RIGHT',
      },
    ],
    inputsInline: false,
    previousStatement: 'Shape',
    nextStatement: 'Shape',
    colour: 120,
    tooltip: 'single object in the simulation',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    rect: () => (
      <block type="simulator_shape">
        <value name="BOUNDING_BOX">
          <block type="simulator_bounding_box_corners" />
        </value>
      </block>
    ),
    ellipse: () => (
      <block type="simulator_shape">
        <field name="SHAPE">ELLIPSE</field>
        <value name="BOUNDING_BOX">
          <block type="simulator_bounding_box_center_dimension" />
        </value>
      </block>
    ),
  },
};

export const SIMULATOR_BOUNDING_BOX_CENTER_DIMENSION = {
  blockJson: {
    type: 'simulator_bounding_box_center_dimension',
    message0: 'centered at (%1, %2) and size %3 x %4',
    args0: [
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
        type: 'field_number',
        name: 'W',
        value: 100,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'H',
        value: 100,
        precision: 1,
      },
    ],
    output: 'BoundingBox',
    colour: 120,
    tooltip: 'bounding box from center and dimension',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_bounding_box_center_dimension" />,
  },
};

export const SIMULATOR_BOUNDING_BOX_CORNERS = {
  blockJson: {
    type: 'simulator_bounding_box_corners',
    message0: 'with corners at (%1, %2) and (%3, %4)',
    args0: [
      {
        type: 'field_number',
        name: 'X1',
        value: -50,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'Y1',
        value: -50,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'X2',
        value: 50,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'Y2',
        value: 50,
        precision: 1,
      },
    ],
    output: 'BoundingBox',
    colour: 120,
    tooltip: 'bounding box from two corners',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_bounding_box_corners" />,
  },
};
