// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '.';

export const HEDGEHOG_READ_ANALOG: Block = {
  blockJson: {
    type: 'hedgehog_read_analog',
    message0: '%{BKY_HEDGEHOG_READ_ANALOG}',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 15,
        "precision": 1
      }
    ],
    output: 'Number',
    colour: 120,
    tooltip: '%{BKY_HEDGEHOG_READ_ANALOG_TOOLTIP}',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: hedgehog_read_analog-body>
      const code = `await getAnalog(${port})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: hedgehog_read_analog-body>
    },
  },
  toolboxBlocks: {
    default: () => (
      <block type="hedgehog_read_analog">{
        // <default GSL customizable: hedgehog_read_analog-default-toolbox />
      }</block>
    ),
    // <default GSL customizable: hedgehog_read_analog-extra-toolbox />
  },
};
