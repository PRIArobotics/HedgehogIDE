// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <GSL customizable: simulation-executor-imports>
// Put your imports tags here
import { schema } from '../../components/ide/Simulator/simulation';

// </GSL customizable: simulation-executor-imports>

export function add(objects: schema.Object[]) {
  connection.send('simulation_add', { objects });
}

export async function get(labels: string[]) {
  connection.send('simulation_get', { labels });
  return connection.recv();
}

export function update(objects: {[label: string]: any}) {
  connection.send('simulation_update', { objects });
}

export function remove(labels: string[]) {
  connection.send('simulation_remove', { labels });
}

export const on = eventHandler.on.bind(eventHandler, 'simulation');
export const emit = eventHandler.emit.bind(eventHandler, 'simulation');
