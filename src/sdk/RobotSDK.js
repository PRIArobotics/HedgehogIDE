// @flow

import SDKBase from './SDKBase';
import Console from '../components/ide/Console';
import Simulator from '../components/ide/Simulator';

class RobotSDK extends SDKBase {
  getConsole: () => Promise<Console>;
  getSimulator: () => Promise<Simulator>;
  onExit: () => void | Promise<void>;

  handlers = {
    commands: ({ robot, cmds }) => {
      cmds.map(([command, payload]) =>
        this.handlers[command]({ robot, ...payload }),
      );
    },
    moveMotor: async ({ robot, port, power }) => {
      (await this.getRobot(robot)).moveMotor(port, power);
    },
    setServo: async ({ robot, port, position }) => {
      (await this.getRobot(robot)).setServo(port, position);
    },
    getAnalog: async ({ robot, port }) => {
      (await this.getRobot(robot)).getAnalog(port);
    },
    getDigital: async ({ robot, port }) => {
      (await this.getRobot(robot)).getDigital(port);
    },
    print: async text => {
      (await this.getConsole()).consoleOut(text, 'stdout');
    },
    exit: async error => {
      // TODO the robot may continue to move here
      // stopping might be a good idea, but might mask the fact that
      // the program is missing an explicit stop command
      if (error) {
        (await this.getConsole()).consoleOut(error, 'stderr');
      }
      this.onExit();
    },
  };

  constructor(
    getConsole: () => Promise<Console>,
    getSimulator: () => Promise<Simulator>,
    onExit: () => void | Promise<void>,
  ) {
    super();
    this.getConsole = getConsole;
    this.getSimulator = getSimulator;
    this.onExit = onExit;
  }

  async getRobot(name: string) {
    return (await this.getSimulator()).robots.get(name);
  }
}
export default RobotSDK;
