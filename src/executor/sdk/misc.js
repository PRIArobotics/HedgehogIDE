// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
// <default GSL customizable: misc-executor-imports>
// Put your imports tags here

// </GSL customizable: misc-executor-imports>

export function print(text: string) {
  connection.send('misc_print', { text });
}

export function exit(error: any) {
  connection.send('misc_exit', { error });
}

