// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <GSL customizable: misc-executor-imports>
// Put your imports tags here

export function call(receiver: string, command: string, payload: any) {
  connection.send('call', { receiver, command, payload });
}

export async function callWithResult(receiver: string, command: string, payload: any) {
  call(receiver, command, payload);
  return connection.recv();
}
// </GSL customizable: misc-executor-imports>

export function print(text: any) {
  connection.send('misc_print', { text });
}

export function exit(error: string | void) {
  connection.send('misc_exit', { error });
}

export function pluginReady() {
  connection.send('misc_pluginReady', {  });
}

export const on = eventHandler.on.bind(eventHandler, 'misc');
export const emit = eventHandler.emit.bind(eventHandler, 'misc');
