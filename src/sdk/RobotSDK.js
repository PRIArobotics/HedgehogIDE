// @flow

import SDKBase, { type Handler } from './SDKBase';
import Console from '../components/ide/Console';
import Simulator from '../components/ide/Simulator';
import { Robot } from '../components/ide/Simulator/Simulation';

class RobotSDK extends SDKBase {
  getConsole: () => Promise<Console>;
  getSimulator: () => Promise<Simulator>;
  onExit: () => void | Promise<void>;

  handlers = {
    commands: RobotSDK.withReply(this.commands.bind(this)),
    moveMotor: RobotSDK.withReply(this.moveMotor.bind(this)),
    setServo: RobotSDK.withReply(this.setServo.bind(this)),
    getAnalog: RobotSDK.withReply(this.getAnalog.bind(this)),
    getDigital: RobotSDK.withReply(this.getDigital.bind(this)),
    print: this.print.bind(this),
    exit: this.exit.bind(this),
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

  commands({ robot, cmds }, executorTask) {
    cmds.map(([command, payload]) => {
      if (Object.prototype.hasOwnProperty.call(this.handlers, command)) {
        // $FlowExpectError
        return this[command]({ robot, ...payload }, executorTask);
      } else {
        return undefined;
      }
    });
  }

  async moveMotor({ robot, port, power }) {
    (await this.getRobot(robot)).moveMotor(port, power);
  }

  async setServo({ robot, port, position }) {
    (await this.getRobot(robot)).setServo(port, position);
  }

  async getAnalog({ robot, port }) {
    return (await this.getRobot(robot)).getAnalog(port);
  }

  async getDigital({ robot, port }) {
    return (await this.getRobot(robot)).getDigital(port);
  }

  async print(text) {
    (await this.getConsole()).consoleOut(text, 'stdout');
  }

  async exit(error) {
    // TODO the robot may continue to move here
    // stopping might be a good idea, but might mask the fact that
    // the program is missing an explicit stop command
    if (error) {
      (await this.getConsole()).consoleOut(error, 'stderr');
    }
    this.onExit();
  }

  async getRobot(name: string): Promise<Robot> {
    return (await this.getSimulator()).robots.get(name);
  }
}
export default RobotSDK;
