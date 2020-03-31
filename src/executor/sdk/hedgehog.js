// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

// <default GSL customizable: hedgehog-executor-imports>
// Put your imports tags here

// </GSL customizable: hedgehog-executor-imports>

export function commands(robot: string, cmds: Command[]) {
  connection.send('hedgehog_commands', { robot, cmds });
}

export async function moveMotor(robot: string, port: number, power: number) {
  connection.send('hedgehog_moveMotor', { robot, port, power });
  return connection.recv();
}

export async function setServo(robot: string, port: number, position: number) {
  connection.send('hedgehog_setServo', { robot, port, position });
  return connection.recv();
}

export async function getAnalog(robot: number, port: number) {
  connection.send('hedgehog_getAnalog', { robot, port });
  return connection.recv();
}

export async function getDigital(robot: number, port: number) {
  connection.send('hedgehog_getDigital', { robot, port });
  return connection.recv();
}

