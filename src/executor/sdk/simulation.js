// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <default GSL customizable: simulation-executor-imports>
// Put your imports tags here

// </GSL customizable: simulation-executor-imports>

export const on = eventHandler.on.bind(eventHandler, 'simulation');
