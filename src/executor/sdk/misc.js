// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <default GSL customizable: misc-executor-imports>
// Put your imports tags here

// </GSL customizable: misc-executor-imports>

export function print(text: string) {
  connection.send('misc_print', { text });
}

export function exit(error: any) {
  connection.send('misc_exit', { error });
}

export function pluginReady() {
  connection.send('misc_pluginReady', {  });
}

export const on = eventHandler.on.bind(eventHandler, 'misc');
