// @flow

export interface Connection {
  send(command: string, payload: any): void;
  recv(): Promise<any>;
}

type Command = [string, any];

export default class Hedgehog {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async commands(...cmds: Array<Command>): Promise<Array<any>> {
    this.connection.send('commands', cmds);
    return /* await */ this.connection.recv();
  }

  static moveMotorCmd(port: number, power: number): Command {
    return ['moveMotor', { port, power }];
  }

  async moveMotor(port: number, power: number) {
    this.connection.send(...Hedgehog.moveMotorCmd(port, power));
    await this.connection.recv();
  }

  static setServoCmd(port: number, position: number | null): Command {
    return ['setServo', { port, position }];
  }

  async setServo(port: number, position: number | null) {
    this.connection.send(...Hedgehog.setServoCmd(port, position));
    await this.connection.recv();
  }

  static getAnalogCmd(port: number): Command {
    return ['getAnalog', { port }];
  }

  async getAnalog(port: number): Promise<number> {
    this.connection.send('getAnalog', { port });
    return /* await */ this.connection.recv();
  }

  static getDigitalCmd(port: number): Command {
    return ['getDigital', { port }];
  }

  async getDigital(port: number): Promise<boolean> {
    this.connection.send('getDigital', { port });
    return /* await */ this.connection.recv();
  }
}
