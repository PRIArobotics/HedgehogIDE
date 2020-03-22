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
        check: 'Tree',
      },
      {
        type: 'input_statement',
        name: 'LINES',
        align: 'RIGHT',
        check: 'Tree',
      },
      {
        type: 'input_statement',
        name: 'ROBOTS',
        align: 'RIGHT',
        check: 'Robot',
      },
    ],
    colour: 120,
    tooltip: 'Configuration for the whole simulation',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_root" />,
  },
};

export const SIMULATOR_RECT = {
  blockJson: {
    type: 'simulator_rect',
    message0: 'Rectangle with size %1 x %2 %3',
    args0: [
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
      {
        type: 'input_value',
        name: 'SETTINGS',
        check: 'SimulatorObjectSettings',
      },
    ],
    previousStatement: 'Tree',
    nextStatement: 'Tree',
    colour: 120,
    tooltip: 'Rectangle defined by its width and height',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_rect" />,
  },
};

export const SIMULATOR_CIRCLE = {
  blockJson: {
    type: 'simulator_circle',
    message0: 'Circle with radius %1 %2',
    args0: [
      {
        type: 'field_number',
        name: 'R',
        value: 50,
        precision: 1,
      },
      {
        type: 'input_value',
        name: 'SETTINGS',
        check: 'SimulatorObjectSettings',
      },
    ],
    previousStatement: 'Tree',
    nextStatement: 'Tree',
    colour: 120,
    tooltip: 'Circle defined by its radius',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_circle" />,
  },
};

export const SIMULATOR_ROBOT = {
  blockJson: {
    type: 'simulator_robot',
    message0: 'Robot "%1" at (%2, %3) and %4',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'hedgehog',
      },
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
        type: 'field_angle',
        name: 'ANGLE',
        angle: 0,
      },
    ],
    previousStatement: 'Robot',
    nextStatement: 'Robot',
    colour: 120,
    tooltip: 'simulated robot',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_robot" />,
  },
};

export const SIMULATOR_SETTINGS_TRANSLATE = {
  blockJson: {
    type: 'simulator_settings_translate',
    message0: 'moved by (%1, %2) %3',
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
        type: 'input_value',
        name: 'MORE',
        check: 'SimulatorObjectSettings',
      },
    ],
    inputsInline: false,
    output: 'SimulatorObjectSettings',
    colour: 120,
    tooltip: 'moves an object or group by the given x/y offset',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_translate" />,
  },
};

export const SIMULATOR_SETTINGS_ROTATE = {
  blockJson: {
    type: 'simulator_settings_rotate',
    message0: 'rotated by %1 %2',
    args0: [
      {
        type: 'field_angle',
        name: 'ANGLE',
        angle: 0,
      },
      {
        type: 'input_value',
        name: 'MORE',
        check: 'SimulatorObjectSettings',
      },
    ],
    inputsInline: false,
    output: 'SimulatorObjectSettings',
    colour: 120,
    tooltip: 'torates an object or group by the given angle',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_rotate" />,
  },
};

export const SIMULATOR_SETTINGS_COLOR = {
  blockJson: {
    type: 'simulator_settings_color',
    message0: 'color: %1 %2',
    args0: [
      {
        type: 'field_colour',
        name: 'COLOUR',
        colour: '#222222',
      },
      {
        type: 'input_value',
        name: 'MORE',
        check: 'SimulatorObjectSettings',
      },
    ],
    inputsInline: false,
    output: 'SimulatorObjectSettings',
    colour: 120,
    tooltip: 'sets the color of an object or group',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_color" />,
  },
};

export const SIMULATOR_SETTINGS_STATIC = {
  blockJson: {
    type: 'simulator_settings_static',
    message0: 'fixed: %1 %2',
    args0: [
      {
        type: 'field_checkbox',
        name: 'STATIC',
        checked: true,
      },
      {
        type: 'input_value',
        name: 'MORE',
        check: 'SimulatorObjectSettings',
      },
    ],
    inputsInline: false,
    output: 'SimulatorObjectSettings',
    colour: 120,
    tooltip: 'makes an object or group immovable or movable',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_static" />,
  },
};

export const SIMULATOR_GROUP = {
  blockJson: {
    type: 'simulator_group',
    message0: 'Group %1 %2',
    args0: [
      {
        type: 'input_value',
        name: 'SETTINGS',
        check: 'SimulatorObjectSettings',
      },
      {
        type: 'input_statement',
        name: 'OBJECTS',
        check: 'Tree',
      },
    ],
    previousStatement: 'Tree',
    nextStatement: 'Tree',
    colour: 120,
    tooltip:
      'Groups multiple objects and applies the settings to all of them. ' +
      'More specific settings win; moving and rotating are composed.',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_group" />,
  },
};
