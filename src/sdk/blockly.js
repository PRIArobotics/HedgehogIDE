// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import ExecutorTask from '../components/ide/Executor/ExecutorTask';
import baseEmit from './base';
// <GSL customizable: blockly-imports>
import * as React from 'react';
import Blockly from 'blockly';
import VisualEditor from '../components/ide/VisualEditor';

export type DynamicBlock = {
  blockJson: Object,
  toolboxBlocksData: {
    [inputName: string]: {
      valueType: string,
      fields: [{
        name: string,
        value: any,
      }]
    }
  }
}

function buildToolboxBlock(block: DynamicBlock) {
  return (
    <block type={block.blockJson.type}>
      {Object.entries(block.toolboxBlocksData).map(([name, input]) => (
        <value name={name}>
          <shadow type={input.valueType}>
            {input.fields.map(field => (
              <field name={field.name}>{field.value}</field>
            ))}
          </shadow>
        </value>
      ))}
    </block>
  )
}

// </GSL customizable: blockly-imports>

export default async function init() {
  // <GSL customizable: blockly-init>
  // Your module initialization code
  let dynamicBlocks: Block[] = [];
  VisualEditor.dynamicBlockLoaders.push(() => {
    console.log('loader called!');
    return dynamicBlocks;
  });
  // </GSL customizable: blockly-init>

  const emit = baseEmit.bind(null, 'blockly');

  async function addBlock(blockDynamic: any) {
    // <GSL customizable: blockly-body-addBlock>
    // Your function code goes here
    const { type } = dynamicBlock.blockJson;
    console.log('adding block');
    if(Blockly.Blocks[type]) {
      throw 'block with given type already exists'
    }

    const block = {
      blockJson: dynamicBlock.blockJson,
        generators: {
      JavaScript: block => {
        return 'print("block called!");\n';
      },
        Python: block => {
        return '';
      }
    },
      toolboxBlocks: {
      default: () => buildToolboxBlock(dynamicBlock),
      }
    };
    dynamicBlocks.push(block);

    Blockly.Blocks[type] = {
      init() {
        this.jsonInit(dynamicBlock.blockJson);
      },
    };
    Blockly.JavaScript[type] = block.generators.JavaScript;
    Blockly.Python[type] = block.generators.Python;
    // </GSL customizable: blockly-body-addBlock>
  }

  return {
    emit,
    handlers: {
      'blockly_addBlock': async ({ blockDynamic }, executorTask: ExecutorTask) => {
        return executorTask.withReply(addBlock.bind(null, blockDynamic));
      },
    },
  };
};
