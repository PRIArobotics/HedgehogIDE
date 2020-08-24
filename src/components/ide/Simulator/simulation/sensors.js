// @flow

import Matter from 'matter-js';

import { Hedgehog } from '.';

/**
 * A collision sensor senses its environment by keeping track of whether it currently collides with
 * other simulation objects.
 * A sensor can restrict the class of relevant collision bodies, and handle its collision state
 * in any way, but usually by setting a sensor value on its controller instance.
 */
export class CollisionSensor {
  sensorBody: Matter.Body;
  collisionCount = 0;

  constructor(sensorBody: Matter.Body) {
    this.sensorBody = sensorBody;

    this.sensorBody.plugin.hedgehog = {
      sensor: this,
    };
  }

  /**
   * Returns whether the body this sensor is colliding with is relevant for the sensor.
   * For example, a touch sensor would not want to detect collisions with sensor bodies,
   * as they are intangible
   */
  // eslint-disable-next-line class-methods-use-this
  matches(_other: Matter.Body): boolean {
    return true;
  }

  /**
   * Updates the sensor state after handling a collision.
   */
  update() {}

  isColliding() {
    return this.collisionCount > 0;
  }

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

    this.update();
  }
}

/**
 * Simple collision sensors are associated with a single sensor port and update that sensor with
 * one of two values, depending on whether there is a collision or not.
 */
export class SimpleCollisionSensor extends CollisionSensor {
  controller: Hedgehog;

  port: number;
  // the sensor value when the sensor body is not collided or collided, respectively
  values: [number, number];

  constructor(
    controller: Hedgehog,
    sensorBody: Matter.Body,
    port: number,
    values: [number, number],
  ) {
    super(sensorBody);

    this.controller = controller;
    this.port = port;
    this.values = values;

    // set initial value to not collided
    this.controller.setSensor(port, values[0]);

    // TODO add noise source to sensor
  }

  update() {
    const value = this.isColliding() ? this.values[1] : this.values[0];
    this.controller.setSensor(this.port, value);
  }
}

/**
 * A touch sensor detects collisions with tangible bodies of the simulation
 */
export class TouchSensor extends SimpleCollisionSensor {
  constructor(controller: Hedgehog, sensorBody: Matter.Body, port: number) {
    super(controller, sensorBody, port, [4095, 0]);
  }

  // eslint-disable-next-line class-methods-use-this
  matches(other: Matter.Body): boolean {
    return !other.isSensor;
  }
}

/**
 * A line sensor detects collisions with lines in the simulation, as indicated by the plugin
 * propery `hedgehog.isLine`.
 */
export class LineSensor extends SimpleCollisionSensor {
  constructor(controller: Hedgehog, sensorBody: Matter.Body, port: number) {
    super(controller, sensorBody, port, [100, 4000]);
  }

  // eslint-disable-next-line class-methods-use-this
  matches(other: Matter.Body): boolean {
    return other.plugin.hedgehog?.isLine ?? false;
  }
}

class DistanceSensorSegment extends CollisionSensor {
  sensor: DistanceSensor;

  distance: number;

  constructor(sensor: DistanceSensor, sensorBody: Matter.Body, distance: number) {
    super(sensorBody);

    this.sensor = sensor;
    this.distance = distance;
  }

  // eslint-disable-next-line class-methods-use-this
  matches(other: Matter.Body): boolean {
    return !other.isSensor;
  }

  update() {
    this.sensor.update();
  }
}

export class DistanceSensor {
  controller: Hedgehog;

  port: number;
  // segments are ordered near to far, so the first colliding segment determines the distance
  segments: DistanceSensorSegment[];
  maxDistance: number;

  constructor(controller: Hedgehog, port: number, segments: [Matter.Body, number][]) {
    this.controller = controller;
    this.port = port;
    this.segments = segments.map(
      ([sensorBody, distance]) => new DistanceSensorSegment(this, sensorBody, distance),
    );
    this.maxDistance = this.segments[this.segments.length - 1].distance;

    // TODO set initial value to maximum distance

    // TODO add noise source to sensor
  }

  update() {
    let distance = null;
    for (const segment of this.segments) {
      if (distance !== null) {
        // this is an obscured segment of the sensor ray
        segment.sensorBody.render.opacity = 0.05;
      } else if (segment.isColliding()) {
        // this is the colliding segment of the sensor ray
        distance = segment.distance;
        segment.sensorBody.render.opacity = 0.7;
      } else {
        // this is a non-obscured segment of the sensor ray
        segment.sensorBody.render.opacity = 0.2;
      }
    }

    // fill in maximum distance
    if (distance === null) distance = this.maxDistance;

    // this is modelled loosely after https://lucsmall.com/images/preview/20130507-voltage-vs-distance.png
    // under a certain distance threshold, the value grows linearly with the distance to the max value
    // over that threshold, the value falls off from the max value inversely with the distance
    const maxValue = 4000;
    const distanceThreshold = 20;
    const bias = 20;
    const value =
      distance < distanceThreshold
        ? maxValue * (distance / distanceThreshold)
        : (maxValue * (distanceThreshold + bias)) / (distance + bias);

    this.controller.setSensor(this.port, value);
  }
}
