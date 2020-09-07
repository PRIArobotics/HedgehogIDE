// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <GSL customizable: blockly-executor-imports>
// Put your imports tags here
import { type DynamicBlock } from '../../sdk/blockly';

// </GSL customizable: blockly-executor-imports>

export async function addBlock(dynamicBlock: DynamicBlock) {
  connection.send('blockly_addBlock', { dynamicBlock });
  return connection.recv();
}

export const on = eventHandler.on.bind(eventHandler, 'blockly');
export const emit = eventHandler.emit.bind(eventHandler, 'blockly');
