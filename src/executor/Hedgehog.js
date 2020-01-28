// @flow

export interface Connection {
  send(command: string, payload: any): void;
  recv(): Promise<any>;
}

export default class Hedgehog {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async moveMotor(port: number, power: number) {
    this.connection.send('moveMotor', { port, power });
    await this.connection.recv();
  }

  async setServo(port: number, position: number | null) {
    this.connection.send('setServo', { port, position });
    await this.connection.recv();
  }

  async getAnalog(port: number): Promise<number> {
    this.connection.send('getAnalog', { port });
    return /* await */ this.connection.recv();
  }

  async getDigital(port: number): Promise<boolean> {
    this.connection.send('getDigital', { port });
    return /* await */ this.connection.recv();
  }
}