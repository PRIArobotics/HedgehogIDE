// @flow

import * as React from 'react';
import Blockly from 'blockly/core';

import * as SimulationSchema from './SimulationSchema';

function anyAncestor(block, condition) {
  for (let ancestor = block.getSurroundParent(); ancestor !== null; ancestor = ancestor.getSurroundParent()) {
    if (condition(ancestor)) return true;
  }
  return false;
}

function forbidsAncestor(types, warning) {
  return function onchange() {
    // Don't change state at the start of a drag.
    if (this.workspace.isDragging()) return;

    // Is the block nested in a forbidden ancestor?
    let legal = !anyAncestor(this, block => types.indexOf(block.type) !== -1);
    if (legal) {
      this.setWarningText(null);
      if (!this.isInFlyout) this.setEnabled(true);
    } else {
      this.setWarningText(warning);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false);
      }
    }
  };
}

// reads the SETTINGS input and recursively that block's MORE input
// to get a settings object
function getSettings() {
  let settings: any = {
    position: { x: 0, y: 0 },
    angle: 0,
  };
  for (
    let block = this.getInputTargetBlock('SETTINGS');
    block !== null;
    block = block.getInputTargetBlock('MORE')
  ) {
    const moreSettings = block.getSettings();
    settings = {
      // overwrite settings with later settings
      ...settings,
      ...moreSettings,
      // however merge some specific properties
      ...(('render' in settings || 'render' in moreSettings
        ? {
            render: {
              ...settings.render,
              ...moreSettings.render,
            },
          }
        : null): any),
      ...(('plugin' in settings || 'plugin' in moreSettings
        ? {
            plugin: {
              hedgehog: {
                ...settings.plugin?.hedgehog,
                ...moreSettings.plugin?.hedgehog,
              },
            },
          }
        : null): any),
    };
  }
  return settings;
}

// collects settings from the object and all its ancestor groups and collects them into one setting object
function collectSettings(object) {
  // position and angle are treated separately to other settings
  let { position, angle, ...settings } = object.getSettings();

  for (
    let group = object.getSurroundParent();
    group.type === 'simulator_group';
    group = group.getSurroundParent()
  ) {
    const { position: outerPosition, angle: outerAngle, ...outerSettings } = group.getSettings();

    const cos = Math.cos(outerAngle);
    const sin = Math.sin(outerAngle);
    position = {
      x: outerPosition.x + cos * position.x - sin * position.y,
      y: outerPosition.y + sin * position.x + cos * position.y,
    };
    angle += outerAngle;

    settings = {
      // we're going from most to least specific, so don't override properties already present
      ...outerSettings,
      ...settings,
      // however merge some specific properties
      ...(('render' in outerSettings || 'render' in settings
        ? {
            render: {
              ...outerSettings.render,
              ...settings.render,
            },
          }
        : null): any),
      ...(('plugin' in outerSettings || 'plugin' in settings
        ? {
            plugin: {
              hedgehog: {
                ...outerSettings.plugin?.hedgehog,
                ...settings.plugin?.hedgehog,
              },
            },
          }
        : null): any),
    };
  }
  return {
    position,
    angle,
    ...settings,
  };
}

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
    onchange() {
      const roots = this.workspace.getBlocksByType('simulator_root');
      this.setWarningText(roots.length >= 2 ? 'only one configuration root allowed' : null);
    },
    serialize(): SimulationSchema.SimulatorJson {
      const objectTypes = ['simulator_robot', 'simulator_rect', 'simulator_circle', 'simulator_svg'];

      function isRobotPart(object) {
        return anyAncestor(object, ancestor => ancestor.type === 'simulator_robot');
      }

      const x = this.getFieldValue('X');
      const y = this.getFieldValue('Y');
      const width = this.getFieldValue('W');
      const height = this.getFieldValue('H');

      let objects = this.getDescendants(true)
        .filter(block => objectTypes.includes(block.type) && !isRobotPart(block))
        .map(object => object.serialize());

      if (this.getField('WALLS').getValueBoolean()) {
        const template = {
          type: "rectangle",
          angle: 0,
          isStatic: true,
          render: {
            fillStyle: '#222222'
          },
        };
        objects = [
          {
            ...template,
            width,
            height: 10,
            position: {
              x: 0,
              y: -(height /2 - 5),
            },
          },
          {
            ...template,
            width,
            height: 10,
            position: {
              x: 0,
              y: height /2 - 5,
            },
          },
          {
            ...template,
            width: 10,
            height,
            position: {
              x: -(width /2 - 5),
              y: 0,
            },
          },
          {
            ...template,
            width: 10,
            height,
            position: {
              x: width /2 - 5,
              y: 0,
            },
          },
          ...objects,
        ];
      }

      return {
        simulation: {
          center: { x, y },
          width,
          height,
        },
        objects,
      };
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
  blockExtras: {
    getFields() {
      return {
        type: 'rectangle',
        width: this.getFieldValue('W'),
        height: this.getFieldValue('H'),
      };
    },
    getSettings,
    serialize(): SimulationSchema.Rectangle {
      return {
        ...this.getFields(),
        ...collectSettings(this),
      };
    },
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
  blockExtras: {
    getFields() {
      return {
        type: 'circle',
        radius: this.getFieldValue('R'),
      };
    },
    getSettings,
    serialize(): SimulationSchema.Circle {
      return {
        ...this.getFields(),
        ...collectSettings(this),
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_circle" />,
  },
};

export const SIMULATOR_SVG = {
  blockJson: {
    type: 'simulator_svg',
    message0: 'SVG %1 @ %2%%, granularity %3 %4',
    args0: [
      {
        type: 'field_input',
        name: 'SRC',
        value: 'asset:foo.svg',
      },
      {
        type: 'field_number',
        name: 'SCALE',
        value: 100,
        min: 1,
        precision: 1,
      },
      {
        type: 'field_number',
        name: 'GRANULARITY',
        value: 15,
        min: 1,
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
    tooltip: 'Shape from SVG',
    helpUrl: 'TODO',
  },
  blockExtras: {
    getFields() {
      return {
        type: 'svg',
        src: this.getFieldValue('SRC'),
        scale: this.getFieldValue('SCALE') / 100,
        granularity: this.getFieldValue('GRANULARITY'),
      };
    },
    getSettings,
    serialize(): SimulationSchema.Svg {
      return {
        ...this.getFields(),
        ...collectSettings(this),
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_svg" />,
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
  blockExtras: {
    getSettings,
  },
  toolboxBlocks: {
    default: () => <block type="simulator_group" />,
  },
};

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
    getFields() {
      return {
        type: 'robot',
        name: this.getFieldValue('NAME'),
      };
    },
    getSettings,
    serialize(): SimulationSchema.Robot {
      const objectTypes = ['simulator_robot_part_touch'];

      const parts = this.getDescendants(true)
        .filter(block => objectTypes.includes(block.type))
        .map(object => object.serialize());

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
    getFields() {
      return {
        type: 'touch',
        port: this.getFieldValue('PORT'),
      };
    },
    serialize(): SimulationSchema.TouchSensor {
      const objectTypes = ['simulator_rect', 'simulator_circle', 'simulator_svg'];

      let objects = this.getDescendants(true)
        .filter(block => objectTypes.includes(block.type))
        .map(object => object.serialize());

      return {
        ...this.getFields(),
        objects,
      };
    },
  },
  toolboxBlocks: {
    default: () => <block type="simulator_robot_part_touch" />,
  },
};

const blocks = [
  SIMULATOR_ROOT,
  SIMULATOR_RECT,
  SIMULATOR_CIRCLE,
  SIMULATOR_SVG,
  SIMULATOR_ROBOT,
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
  SIMULATOR_ROBOT_PART_TOUCH,
  SIMULATOR_GROUP,
];

blocks.forEach(block => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
    ...block.blockExtras,
  };
});

export default blocks;
