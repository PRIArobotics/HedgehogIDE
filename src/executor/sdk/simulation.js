// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <GSL customizable: simulation-executor-imports>
// Put your imports tags here
import * as SimulationSchema from '../../components/ide/SimulatorEditor/SimulationSchema';

// </GSL customizable: simulation-executor-imports>

export function add(objects: SimulationSchema.Object[]) {
  connection.send('simulation_add', { objects });
}

export function remove(labels: string[]) {
  connection.send('simulation_remove', { labels });
}

export const on = eventHandler.on.bind(eventHandler, 'simulation');
export const emit = eventHandler.emit.bind(eventHandler, 'simulation');
