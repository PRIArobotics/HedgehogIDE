// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import ExecutorTask from '../components/ide/Executor/ExecutorTask';
import { emit as baseEmit, emitToAll as baseEmitToAll } from './base';
import VisualEditor from '../components/ide/VisualEditor';
// <GSL customizable: blockly-imports>
import * as React from 'react';
import Blockly from 'blockly';

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
  const emitToAll = baseEmitToAll.bind(null, 'blockly');

  async function addBlock(dynamicBlock: DynamicBlock) {
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
    emitToAll,
    handlers: {
      'blockly_addBlock': async ({ block }, executorTask: ExecutorTask) => {
        return executorTask.withReply(addBlock.bind(null, block));
      },
    },
  };
};
