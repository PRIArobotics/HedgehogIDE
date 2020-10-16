// @flow

import * as React from 'react';

import { schema } from '../../Simulator/simulation';

import { getSettings, collectSettings } from './helpers';

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
    serialize(): schema.Rectangle {
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
    serialize(): schema.Circle {
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
    serialize(): schema.Svg {
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

export default [
  SIMULATOR_RECT,
  SIMULATOR_CIRCLE,
  SIMULATOR_SVG,
  SIMULATOR_GROUP,
];
