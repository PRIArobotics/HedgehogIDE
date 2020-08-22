export class CollisionSensor {
  controller: Hedgehog;

  sensorBody: Matter.Body;
  port: number;
  // the sensor value when the sensor body is not collided or collided, respectively
  values: [number, number];
  collisionCount = 0;

  constructor(
    controller: Hedgehog,
    sensorBody: Matter.Body,
    port: number,
    values: [number, number],
  ) {
    this.controller = controller;
    this.sensorBody = sensorBody;
    this.port = port;
    this.values = values;

    controller.setSensor(port, values[0]);
    sensorBody.plugin.hedgehog = {
      sensor: this,
    };
  }

  handleCollision(eventName: 'collisionStart' | 'collisionEnd') {
    switch (eventName) {
      case 'collisionStart':
        this.collisionCount += 1;
        break;
      case 'collisionEnd':
        this.collisionCount -= 1;
        break;
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
    const value = this.collisionCount === 0 ? this.values[0] : this.values[1];
    this.controller.setSensor(this.port, value);
  }
}
