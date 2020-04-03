// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <default GSL customizable: blockly-executor-imports>
// Put your imports tags here

// </GSL customizable: blockly-executor-imports>

export async function addBlock(block: any) {
  connection.send('blockly_addBlock', { block });
  return connection.recv();
}

export const on = eventHandler.on.bind(eventHandler, 'blockly');