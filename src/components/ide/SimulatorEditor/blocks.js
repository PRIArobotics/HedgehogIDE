// @flow

import * as React from 'react';

function forbidsAncestor(types, warning) {
  return function onchange(event) {
    // Don't change state at the start of a drag.
    if (this.workspace.isDragging()) return;
    let legal = true;
    // Is the block nested in a scope?
    for (let block = this; (block = block.getSurroundParent()) !== null; ) {
      if (types.indexOf(block.type) !== -1) {
        legal = false;
        break;
      }
    }
    if (legal) {
      this.setWarningText(null);
      if (!this.isInFlyout) this.setDisabled(false);
    } else {
      this.setWarningText(warning);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setDisabled(true);
      }
    }
  };
}

export const SIMULATOR_ROOT = {
  blockJson: {
    type: 'simulator_root',
    message0: 'Simulation centered at (%1, %2) sized %3 x %4 %5 %6',
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
    onchange() {
      const roots = this.workspace.getBlocksByType('simulator_root');
      this.setWarningText(
        roots.length >= 2 ? 'only one configuration root allowed' : null,
      );
    },
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
    previousStatement: 'SimulatorObject',
    nextStatement: 'SimulatorObject',
    colour: 240,
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
    previousStatement: 'SimulatorObject',
    nextStatement: 'SimulatorObject',
    colour: 240,
    tooltip: 'Circle defined by its radius',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_circle" />,
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
        check: 'SimulatorObject',
      },
    ],
    previousStatement: 'SimulatorObject',
    nextStatement: 'SimulatorObject',
    colour: 270,
    tooltip:
      'Groups multiple objects and applies the settings to all of them. ' +
      'More specific settings win; moving and rotating are composed.',
    helpUrl: 'TODO',
  },
  toolboxBlocks: {
    default: () => <block type="simulator_group" />,
  },
};

export const SIMULATOR_ROBOT = {
  blockJson: {
    type: 'simulator_robot',
    message0: 'Robot "%1" %2',
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
    ],
    previousStatement: 'SimulatorObject',
    nextStatement: 'SimulatorObject',
    colour: 90,
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
    colour: 180,
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
    colour: 180,
    tooltip: 'rotates an object or group by the given angle',
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
    colour: 180,
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
    colour: 180,
    tooltip: 'a static object can not be moved',
    helpUrl: 'TODO',
  },
  blockExtras: {
    onchange: forbidsAncestor(['simulator_robot'], 'robots can not be fixed'),
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_static" />,
  },
};

export const SIMULATOR_SETTINGS_SENSOR = {
  blockJson: {
    type: 'simulator_settings_sensor',
    message0: 'passive: %1 %2',
    args0: [
      {
        type: 'field_checkbox',
        name: 'SENSOR',
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
    colour: 180,
    tooltip: 'a passive object does not interact with other objects',
    helpUrl: 'TODO',
  },
  blockExtras: {
    onchange: forbidsAncestor(['simulator_robot'], 'robots can not be passive'),
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_sensor" />,
  },
};
