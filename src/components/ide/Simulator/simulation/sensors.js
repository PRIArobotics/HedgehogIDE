// @flow

import Matter from 'matter-js';

import { Hedgehog } from '.';

export class CollisionSensor {
  controller: Hedgehog;

  sensorBody: Matter.Body;
  collisionCount = 0;

  constructor(
    controller: Hedgehog,
    sensorBody: Matter.Body,
  ) {
    this.controller = controller;
    this.sensorBody = sensorBody;

    sensorBody.plugin.hedgehog = {
      sensor: this,
    };
  }

  /**
   * Returns whether the body this sensor is colliding with is relevant for the sensor.
   * For example, a touch sensor would not want to detect collisions with sensor bodies,
   * as they are intangible
   */
  matches(other: Matter.Body): boolean {
    return true;
  }

  /**
   * Updates the sensor state after handling a collision.
   */
  update(colliding: boolean) {}

  handleCollision(eventName: 'collisionStart' | 'collisionEnd', other: Matter.Body) {
    if (!this.matches(other)) return;

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

    this.update(this.collisionCount > 0);
  }
}

export class SimpleCollisionSensor extends CollisionSensor {
  port: number;
  // the sensor value when the sensor body is not collided or collided, respectively
  values: [number, number];

  constructor(
    controller: Hedgehog,
    sensorBody: Matter.Body,
    port: number,
    values: [number, number],
  ) {
    super(controller, sensorBody);
    this.port = port;
    this.values = values;

    controller.setSensor(port, values[0]);
  }

  update(colliding: boolean) {
    const value = colliding ? this.values[1] : this.values[0];
    this.controller.setSensor(this.port, value);
  }
}

export class TouchSensor extends SimpleCollisionSensor {
  matches(other: Matter.Body): boolean {
    return !other.isSensor;
  }
}

export class LineSensor extends SimpleCollisionSensor {
  matches(other: Matter.Body): boolean {
    return other.plugin.hedgehog?.isLine ?? false;
  }
}
