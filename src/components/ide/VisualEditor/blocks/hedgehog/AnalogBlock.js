// @flow

import * as React from 'react';
import Blockly from 'blockly';

import { type Block } from '..';

const AnalogBlock: Block = {
  blockJson: {
    type: 'AnalogBlock',
    message0: 'analog port %1',
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
    tooltip: 'get the value of an analog port',
    helpUrl: 'TODO',
  },
  generators: {
    JavaScript: block => {
      const port = block.getFieldValue('PORT');
      // <GSL customizable: AnalogBlock-body>
      const code = `await getAnalog(${port})`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
      // </GSL customizable: AnalogBlock-body>
    },
  },
toolboxBlocks: {
    default: () => (
      <block type="AnalogBlock">{
        // <default GSL customizable: AnalogBlock-default-toolbox />
      }</block>
    ),
    // <default GSL customizable: AnalogBlock-extra-toolbox />
  },
};

export default AnalogBlock;
