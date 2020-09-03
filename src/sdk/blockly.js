// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import TaskExecutor from '../components/ide/Executor/TaskExecutor';
import baseEmit from './base';
// <GSL customizable: blockly-imports>
import * as React from 'react';
import Blockly from 'blockly';
import VisualEditor from '../components/ide/VisualEditor';

import { type Block, registerBlocklyBlock } from '../components/ide/VisualEditor/blocks';

export type Input = {
  valueType: string,
  fields: [
    {
      name: string,
      value: any,
    },
  ],
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
          let code = `const payload = {};\n`;
          dynamicBlock.blockJson.args0.forEach(arg => {
            // Hope this actually works
            const res =
              Blockly.JavaScript.valueToCode(
                block,
                arg.name,
                Blockly.JavaScript.ORDER_NONE,
              ) ?? block.getFieldValue(arg.name);
            code += `payload['${arg.name}'] = ${res};\n`;
          });
          code += `await sdk.misc.emit('blockly', 'blk_${type}_called', payload);\n`;
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
      'blockly_addBlock': async ({ dynamicBlock }: { dynamicBlock: DynamicBlock }, taskExecutor: TaskExecutor) => {
        return taskExecutor.withReply(addBlock.bind(null, dynamicBlock));
      },
    },
  };
}
