// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import { type TaskHandle } from '../components/ide/Executor/Executor';
import baseEmit from './base';
// <GSL customizable: hedgehog-imports>
import { type SimulatorType } from '../components/ide/Simulator';
import { Robot } from '../components/ide/Simulator/simulation';
import { type Command } from '../executor/Hedgehog';
// </GSL customizable: hedgehog-imports>

export default async function init(getSimulator: () => Promise<SimulatorType>) {
  // <GSL customizable: hedgehog-init>
  async function getRobot(name: string): Promise<Robot> {
    const robot = (await getSimulator()).simulation.robots.get(name);
    if (robot === undefined) throw new Error(`no robot named "${name}"`);
    return robot;
  }
  // </GSL customizable: hedgehog-init>

  const emit = baseEmit.bind(null, 'hedgehog');

  const moduleFunctions = {
    'commands': ({ robot, cmds }) => commands(robot, cmds),
    'moveMotor': ({ robot, port, power }) => moveMotor(robot, port, power),
    'setServo': ({ robot, port, position }) => setServo(robot, port, position),
    'getAnalog': ({ robot, port }) => getAnalog(robot, port),
    'getDigital': ({ robot, port }) => getDigital(robot, port),
    'sleep': ({ millis }) => sleep(millis),
  };

  async function commands(robot: string, cmds: Command[]) {
    // <GSL customizable: hedgehog-body-commands>
    return /* await */ Promise.all(
      cmds.map(([command, payload]) => {
        if (Object.prototype.hasOwnProperty.call(moduleFunctions, command)) {
          // $FlowExpectError
          return moduleFunctions[command]({ robot, ...payload });
        } else {
          return undefined;
        }
      }),
    );
    // </GSL customizable: hedgehog-body-commands>
  }

  async function moveMotor(robot: string, port: number, power: number) {
    // <GSL customizable: hedgehog-body-moveMotor>
    (await getRobot(robot)).controller.moveMotor(port, power);
    // </GSL customizable: hedgehog-body-moveMotor>
  }

  async function setServo(robot: string, port: number, position: number) {
    // <GSL customizable: hedgehog-body-setServo>
    // Your function code goes here
    (await getRobot(robot)).controller.setServo(port, position);
    // </GSL customizable: hedgehog-body-setServo>
  }

  async function getAnalog(robot: string, port: number) {
    // <GSL customizable: hedgehog-body-getAnalog>
    return (await getRobot(robot)).controller.getAnalog(port);
    // </GSL customizable: hedgehog-body-getAnalog>
  }

  async function getDigital(robot: string, port: number) {
    // <GSL customizable: hedgehog-body-getDigital>
    return (await getRobot(robot)).controller.getDigital(port);
    // </GSL customizable: hedgehog-body-getDigital>
  }

  async function sleep(millis: number) {
    // <GSL customizable: hedgehog-body-sleep>
    const simulation = (await getSimulator()).simulation;
    await simulation.sleep(millis);
    // </GSL customizable: hedgehog-body-sleep>
  }

  return {
    // <default GSL customizable: hedgehog-extra-return>
    // Space for extra exports

    // </GSL customizable: hedgehog-extra-return>
    emit,
    handlers: {
      'hedgehog_commands': async ({ robot, cmds }: { robot: string, cmds: Command[] }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, commands.bind(null, robot, cmds));
      },
      'hedgehog_moveMotor': async ({ robot, port, power }: { robot: string, port: number, power: number }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, moveMotor.bind(null, robot, port, power));
      },
      'hedgehog_setServo': async ({ robot, port, position }: { robot: string, port: number, position: number }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, setServo.bind(null, robot, port, position));
      },
      'hedgehog_getAnalog': async ({ robot, port }: { robot: string, port: number }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, getAnalog.bind(null, robot, port));
      },
      'hedgehog_getDigital': async ({ robot, port }: { robot: string, port: number }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, getDigital.bind(null, robot, port));
      },
      'hedgehog_sleep': async ({ millis }: { millis: number }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, sleep.bind(null, millis));
      },
    },
  };
}
