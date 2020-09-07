// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import connection from '../connection';
import eventHandler from '../event';
// <GSL customizable: hedgehog-executor-imports>
// Put your imports tags here
import { type Command } from '../Hedgehog';

// </GSL customizable: hedgehog-executor-imports>

export async function commands(robot: string, cmds: Command[]) {
  connection.send('hedgehog_commands', { robot, cmds });
  return connection.recv();
}

export async function moveMotor(robot: string, port: number, power: number) {
  connection.send('hedgehog_moveMotor', { robot, port, power });
  return connection.recv();
}

export async function setServo(robot: string, port: number, position: number) {
  connection.send('hedgehog_setServo', { robot, port, position });
  return connection.recv();
}

export async function getAnalog(robot: string, port: number) {
  connection.send('hedgehog_getAnalog', { robot, port });
  return connection.recv();
}

export async function getDigital(robot: string, port: number) {
  connection.send('hedgehog_getDigital', { robot, port });
  return connection.recv();
}

export async function sleep(millis: number) {
  connection.send('hedgehog_sleep', { millis });
  return connection.recv();
}

export const on = eventHandler.on.bind(eventHandler, 'hedgehog');
export const emit = eventHandler.emit.bind(eventHandler, 'hedgehog');
