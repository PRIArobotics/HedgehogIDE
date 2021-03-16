// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <GSL customizable: misc-executor-imports>
// Put your imports tags here
import callHandler from '../call';

export const call = callHandler.call.bind(callHandler);
export const callWithReply = callHandler.callWithReply.bind(callHandler);
export const registerCall = callHandler.registerCall.bind(callHandler);
export const registerCallWithReply = callHandler.registerCallWithReply.bind(callHandler);
// </GSL customizable: misc-executor-imports>

export function print(text: any) {
  connection.send('misc_print', { text });
}

export async function getInput() {
  connection.send('misc_getInput', {  });
  return connection.recv();
}

export async function getBestLocale(localeOptions: string[]) {
  connection.send('misc_getBestLocale', { localeOptions });
  return connection.recv();
}

export function exit(error: string | void) {
  connection.send('misc_exit', { error });
}

export function pluginReady() {
  connection.send('misc_pluginReady', {  });
}

export const on = eventHandler.on.bind(eventHandler, 'misc');
export const emit = eventHandler.emit.bind(eventHandler, 'misc');
