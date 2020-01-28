// @flow

export interface Connection {
  send(command: string, payload: any): void;
  recv(): Promise<any>;
}

type Command = [string, any];

export default class Hedgehog {
  name: string;
  connection: Connection;

  constructor(name: string, connection: Connection) {
    this.name = name;
    this.connection = connection;
  }

  async send(command: string, payload: any) {
    await this.connection.send(command, {
      robot: this.name,
      ...payload,
    });
    return /* await */ this.connection.recv();
  }

  async commands(...cmds: Array<Command>): Promise<Array<any>> {
    return /* await */ this.send('commands', { cmds });
  }

  static moveMotorCmd(port: number, power: number): Command {
    return ['moveMotor', { port, power }];
  }

  async moveMotor(port: number, power: number) {
    await this.send(...Hedgehog.moveMotorCmd(port, power));
  }

  static setServoCmd(port: number, position: number | null): Command {
    return ['setServo', { port, position }];
  }

  async setServo(port: number, position: number | null) {
    await this.send(...Hedgehog.setServoCmd(port, position));
  }

  static getAnalogCmd(port: number): Command {
    return ['getAnalog', { port }];
  }

  async getAnalog(port: number): Promise<number> {
    return /* await */ this.send('getAnalog', { port });
  }

  static getDigitalCmd(port: number): Command {
    return ['getDigital', { port }];
  }

  async getDigital(port: number): Promise<boolean> {
    return /* await */ this.send('getDigital', { port });
  }
}
