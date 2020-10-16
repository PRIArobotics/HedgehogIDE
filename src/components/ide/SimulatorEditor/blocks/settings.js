// @flow

import * as React from 'react';

import { schema } from '../../Simulator/simulation';

import { forbidsAncestor } from './helpers';

export const SIMULATOR_SETTINGS_TRANSLATE = {
  blockJson: {
    type: 'simulator_settings_translate',
    message0: 'moved by (%1, %2) %3',
    args0: [
      {
        type: 'field_number',
        name: 'X',
        value: 0,
      },
      {
        type: 'field_number',
        name: 'Y',
        value: 0,
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
  blockExtras: {
    getSettings() {
      return {
        position: {
          x: this.getFieldValue('X'),
          y: this.getFieldValue('Y'),
        },
      };
    },
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
  blockExtras: {
    getSettings() {
      return {
        angle: -(this.getFieldValue('ANGLE') / 180) * Math.PI,
      };
    },
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
  blockExtras: {
    getSettings() {
      return {
        render: {
          fillStyle: this.getFieldValue('COLOUR'),
        },
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_color" />,
  },
};

export const SIMULATOR_SETTINGS_VISIBILITY = {
  blockJson: {
    type: 'simulator_settings_visibility',
    message0: 'visible: %1 %2%% %3',
    args0: [
      {
        type: 'field_checkbox',
        name: 'VISIBILITY',
        checked: true,
      },
      {
        type: 'field_number',
        name: 'OPACITY',
        value: 100,
        min: 0,
        max: 100,
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
    tooltip: 'sets the visibility of an object or group',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getSettings() {
      return {
        render: {
          opacity: this.getFieldValue('OPACITY') / 100,
          visible: this.getField('VISIBILITY').getValueBoolean(),
        },
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_visibility" />,
  },
};

export const SIMULATOR_SETTINGS_SPRITE = {
  blockJson: {
    type: 'simulator_settings_sprite',
    message0: 'sprite: %1 %2',
    args0: [
      {
        type: 'field_input',
        name: 'URL',
        value: '',
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
    tooltip: 'sets a sprite to use to draw the object instead of a color',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getSettings() {
      const url = this.getFieldValue('URL');
      return {
        render: {
          sprite: { texture: url },
        },
      };
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="simulator_settings_sprite">
        <field name="URL">asset:foo.png</field>
      </block>
    ),
    external: () => (
      <block type="simulator_settings_sprite">
        <field name="URL">https://example.com/foo.png</field>
      </block>
    ),
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
    tooltip: 'a fixed object can not be moved',
    helpUrl: 'TODO',
  },
  blockExtras: {
    onchange: forbidsAncestor(['simulator_robot'], 'robots can not be fixed'),
    getSettings() {
      return {
        isStatic: this.getField('STATIC').getValueBoolean(),
      };
    },
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
    getSettings() {
      return {
        isSensor: this.getField('SENSOR').getValueBoolean(),
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_sensor" />,
  },
};

export const SIMULATOR_SETTINGS_LINE = {
  blockJson: {
    type: 'simulator_settings_line',
    message0: 'line: %1 %2',
    args0: [
      {
        type: 'field_checkbox',
        name: 'LINE',
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
    tooltip: 'a line can be detected by line sensors; lines must also be set to passive',
    helpUrl: 'TODO',
  },
  blockExtras: {
    onchange: forbidsAncestor(['simulator_robot'], 'robots can not be lines'),
    getSettings() {
      return {
        plugin: {
          hedgehog: {
            isLine: this.getField('LINE').getValueBoolean(),
          },
        },
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_line" />,
  },
};

export const SIMULATOR_SETTINGS_DENSITY = {
  blockJson: {
    type: 'simulator_settings_density',
    message0: 'density: %1 %2',
    args0: [
      {
        type: 'field_number',
        name: 'DENSITY',
        value: 1,
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
    tooltip: 'density together with object size determines its weight',
    helpUrl: 'TODO',
  },
  blockExtras: {
    onchange: forbidsAncestor(['simulator_robot'], 'robots have fixed density'),
    getSettings() {
      return {
        density: this.getFieldValue('DENSITY'),
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_density" />,
  },
};

export const SIMULATOR_SETTINGS_FRICTION_AIR = {
  blockJson: {
    type: 'simulator_settings_friction_air',
    message0: 'friction: %1 %2',
    args0: [
      {
        type: 'field_number',
        name: 'FRICTION_AIR',
        value: 0.4,
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
    tooltip: 'friction determines how much resistance a sliding object experiences',
    helpUrl: 'TODO',
  },
  blockExtras: {
    onchange: forbidsAncestor(['simulator_robot'], 'robots have fixed friction'),
    getSettings() {
      return {
        frictionAir: this.getFieldValue('FRICTION_AIR'),
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_friction_air" />,
  },
};

export const SIMULATOR_SETTINGS_LABEL = {
  blockJson: {
    type: 'simulator_settings_label',
    message0: 'label: %1 %2',
    args0: [
      {
        type: 'field_input',
        name: 'LABEL',
        value: '',
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
    tooltip:
      'sets a label for the body which can be used to identify the body and improve handling',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getSettings() {
      return {
        label: this.getFieldValue('LABEL'),
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_settings_label" />,
  },
};

export default [
  SIMULATOR_SETTINGS_TRANSLATE,
  SIMULATOR_SETTINGS_ROTATE,
  SIMULATOR_SETTINGS_COLOR,
  SIMULATOR_SETTINGS_VISIBILITY,
  SIMULATOR_SETTINGS_SPRITE,
  SIMULATOR_SETTINGS_STATIC,
  SIMULATOR_SETTINGS_SENSOR,
  SIMULATOR_SETTINGS_LINE,
  SIMULATOR_SETTINGS_DENSITY,
  SIMULATOR_SETTINGS_FRICTION_AIR,
  SIMULATOR_SETTINGS_LABEL,
];
