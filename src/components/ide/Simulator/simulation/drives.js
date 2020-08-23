// @flow

import Matter from 'matter-js';

import { Point, Hedgehog } from '.';

export class DifferentialDrive {
  controller: Hedgehog;

  leftPort: number;
  rightPort: number;

  leftWheel: Matter.Body;
  rightWheel: Matter.Body;
  body: Matter.Body;

  constructor(
    controller: Hedgehog,
    leftPort: number,
    rightPort: number,
    leftWheel: Matter.Body,
    rightWheel: Matter.Body,
    body: Matter.Body,
  ) {
    this.controller = controller;
    this.leftPort = leftPort;
    this.rightPort = rightPort;
    this.leftWheel = leftWheel;
    this.rightWheel = rightWheel;
    this.body = body;
  }

  applyForce(pos: Point, force: number, cos: number, sin: number) {
    Matter.Body.applyForce(this.body, pos, {
      x: force * cos,
      y: force * sin,
    });
  }

  beforeUpdate() {
    const lPos = this.leftWheel.position;
    const rPos = this.rightWheel.position;
    const dx = lPos.x - rPos.x;
    const dy = lPos.y - rPos.y;
    const hypot = Math.hypot(dx, dy);

    // cosine and sine of the angle in which the forces are directed
    // this is normal to the axis of the wheels, therefore [-dy, dx] instead of [dx, dy]
    const cos = -dy / hypot;
    const sin = dx / hypot;

    this.applyForce(lPos, this.controller.getMotor(this.leftPort) / 800, cos, sin);
    this.applyForce(rPos, this.controller.getMotor(this.rightPort) / 800, cos, sin);
  }
}
