// @flow

export interface Connection {
  send(command: string, payload: any): void;
  recv(): Promise<any>;
}

type Command = [string, any];

export default class Hedgehog {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async commands(...cmds: Command[]): Promise<any[]> {
    return sdk.hedgehog.commands(this.name, cmds);
  }

  static moveMotorCmd(port: number, power: number): Command {
    return ['moveMotor', { port, power }];
  }

  async moveMotor(port: number, power: number) {
    return sdk.hedgehog.moveMotor(this.name, port, power);
  }

  static setServoCmd(port: number, position: number | null): Command {
    return ['setServo', { port, position }];
  }

  async setServo(port: number, position: number | null) {
    return sdk.hedgehog.setServo(this.name, port, position);
  }

  static getAnalogCmd(port: number): Command {
    return ['getAnalog', { port }];
  }

  async getAnalog(port: number): Promise<number> {
    return sdk.hedgehog.getAnalog(this.name, port);
  }

  static getDigitalCmd(port: number): Command {
    return ['getDigital', { port }];
  }

  async getDigital(port: number): Promise<boolean> {
    return sdk.hedgehog.getDigital(this.name, port);
  }
}
