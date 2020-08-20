// @flow

type Motor = {
  power: number,
  onChange: ((port: number, power: number) => void) | null,
};

type Servo = {
  position: number | null,
  onChange: ((port: number, position: number | null) => void) | null,
};

type Sensor = {
  analogValue: number,
  noiseSource: ((port: number, analogValue: number) => number) | null,
};

function createArray<T>(length: number, cb: (index: number) => T): T[] {
  // Array.from({ length: n }, (v, i) => ...):
  // first parameter is array-like, so `length` is an array length
  // all values (`v`) are `undefined`, map them to something else.

  return Array.from({ length }, (elem, index) => cb(index));
}

/**
 * The Hedgehog class represents the controller of a simulated robot.
 * As such, it manages the simulated sensors (whose input values are set by the simulation when changes occur)
 * and actuators (which are set by user programs and queried by the simulation when needed).
 */
export default class Hedgehog {
  // motor (port = 0..4) power, -100..=100
  motors: Motor[] = createArray(4, () => ({ power: 0, onChange: null }));
  // servo (port = 0..6) positions, 0..=1000 or null
  servos: Servo[] = createArray(6, () => ({ position: null, onChange: null }));
  // sensor (port = 0..16) value inferred from the simulation
  // the value here is "exact"; an analog value read by a user program should
  // have some noise applied to it
  sensors: Sensor[] = createArray(16, () => ({ analogValue: 4095, noiseSource: null }));

  // "public" APIs for the client

  moveMotor(port: number, power: number) {
    this.motors[port].power = power;
    this.motors[port].onChange?.(port, power);
  }

  setServo(port: number, position: number | null) {
    this.servos[port].position = position;
    this.servos[port].onChange?.(port, position);
  }

  getAnalog(port: number): number {
    const { analogValue, noiseSource } = this.sensors[port];

    const noise = noiseSource?.(port, analogValue) ?? 0;
    const result = analogValue + noise;

    if (result > 4095) return 4095;
    if (result < 0) return 0;
    return result;
  }

  getDigital(port: number): boolean {
    return this.getAnalog(port) > 2047;
  }

  // "private" APIs needed by the simulation

  getMotor(port: number): number {
    return this.motors[port].power;
  }

  getServo(port: number): number | null {
    return this.servos[port].position;
  }

  setSensor(port: number, value: number) {
    this.sensors[port].analogValue = value;
  }
}
