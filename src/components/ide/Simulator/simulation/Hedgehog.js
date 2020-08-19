// @flow

/**
 * The Hedgehog class represents the controller of a simulated robot.
 * As such, it manages the simulated sensors (whose input values are set by the simulation when changes occur)
 * and actuators (which are set by user programs and queried by the simulation when needed).
 */
export default class Hedgehog {
  // Array.from({ length: n }, (v, i) => ...):
  // first parameter is array-like, so `length` is an array length
  // all values (`v`) are `undefined`, map them to something else.

  // motor (port = 0..4) power, -100..=100
  motors: number[] = Array.from({ length: 4 }, () => 0);
  // servo (port = 0..6) positions, 0..=1000 or null
  servos: (number | null)[] = Array.from({ length: 6 }, () => null);
  // sensor (port = 0..16) value inferred from the simulation
  // the value here is "exact"; an analog value read by a user program should
  // have some noise applied to it
  sensors: number[] = Array.from({ length: 16 }, () => 4095);

  // "public" APIs for the client

  moveMotor(port: number, power: number) {
    this.motors[port] = power;
  }

  setServo(port: number, position: number | null) {
    this.servos[port] = position;
  }

  getAnalog(port: number): number {
    // TODO noise
    const noise = 0;
    const result = this.sensors[port] + noise;

    if (result > 4095) return 4095;
    if (result < 0) return 0;
    return result;
  }

  getDigital(port: number): boolean {
    return this.getAnalog(port) > 2047;
  }

  // "private" APIs needed by the simulation

  getMotor(port: number): number {
    return this.motors[port];
  }

  getServo(port: number): number | null {
    return this.servos[port];
  }

  setSensor(port: number, value: number) {
    this.sensors[port] = value;
  }
}
