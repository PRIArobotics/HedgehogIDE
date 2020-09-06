// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import { type TaskHandle } from '../components/ide/Executor/Executor';
import baseEmit from './base';
// <GSL customizable: blockly-imports>
import * as React from 'react';
import Blockly from 'blockly';
import VisualEditor from '../components/ide/VisualEditor';

import { type Block, registerBlocklyBlock } from '../components/ide/VisualEditor/blocks';

export type Input = {
  valueType: string,
  fields: {
    name: string,
    value: any,
  }[],
};
export type DynamicBlock = {
  blockJson: Object,
  toolboxBlocksData: {
    [inputName: string]: Input,
  },
};

function buildToolboxBlock(block: DynamicBlock): React.Node {
  return (
    <block type={block.blockJson.type}>
      {Object.entries(block.toolboxBlocksData).map(([name, input0]) => {
        // $FlowExpectError
        const input: Input = input0;

        return (
          <value name={name}>
            <shadow type={input.valueType}>
              {input.fields.map(field => (
                <field name={field.name}>{field.value}</field>
              ))}
            </shadow>
          </value>
        );
      })}
    </block>
  );
}

// </GSL customizable: blockly-imports>

export default async function init() {
  // <GSL customizable: blockly-init>
  // Your module initialization code
  const dynamicBlocks: Block[] = [];
  VisualEditor.dynamicBlockLoaders.push(() => {
    return dynamicBlocks;
  });
  // </GSL customizable: blockly-init>

  const emit = baseEmit.bind(null, 'blockly');

  async function addBlock(dynamicBlock: DynamicBlock) {
    // <GSL customizable: blockly-body-addBlock>
    // Your function code goes here
    const { type } = dynamicBlock.blockJson;
    if (type in Blockly.Blocks) {
      throw new Error(`block with type '${type}' already exists`);
    }

    const block = {
      blockJson: dynamicBlock.blockJson,
      generators: {
        JavaScript: block => {
          let code = '';
          code += `await sdk.misc.emit('blockly', 'blk_${type}_called', {\n`;
          for (const { name, type } of dynamicBlock.blockJson.args0) {
            let res;
            if (type === 'input_value') {
              res = Blockly.JavaScript.valueToCode(block, name, Blockly.JavaScript.ORDER_NONE);
            } else if (type === 'input_statement') {
              // TODO input_statement unsupported for now
              res = undefined;
            } else if (type === 'input_dummy') {
              // nothing to do
              res = undefined;
            } else if (type.startsWith('field_')) {
              res = block.getFieldValue(name);
            } else {
              // hopefully unreachable
              res = undefined;
            }

            if (res !== undefined) code += `  ${name}: ${res},\n`;
          }
          code += `});\n`;
          return code;
        },
        Python: block => {
          return '';
        }
      },
      toolboxBlocks: {
        default: () => buildToolboxBlock(dynamicBlock),
      },
    };
    dynamicBlocks.push(block);
    registerBlocklyBlock(block);
    // </GSL customizable: blockly-body-addBlock>
  }

  return {
    // <default GSL customizable: blockly-extra-return>
    // Space for extra exports

    // </GSL customizable: blockly-extra-return>
    emit,
    handlers: {
      'blockly_addBlock': async ({ dynamicBlock }: { dynamicBlock: DynamicBlock }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(addBlock.bind(null, dynamicBlock));
      },
    },
  };
}
