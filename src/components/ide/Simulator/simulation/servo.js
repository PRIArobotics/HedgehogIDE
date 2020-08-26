// @flow

import Matter from 'matter-js';

import { Pose, Point, Hedgehog } from '.';

function poseToPoint({ x, y }: Pose): Point {
  return { x, y };
}

function transform(
  { x, y, angle }: Pose,
  { x: dx, y: dy, angle: dangle }: Pose,
): Pose {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x + cos * dx - sin * dy,
    y: y + sin * dx + cos * dy,
    angle: angle + dangle,
  };
}

export class ServoArm {
  controller: Hedgehog;

  port: number;

  anchor: Matter.Body;
  pivotAnchor: Pose;
  arm: Matter.Body;
  pivotArm: Pose;
  length: number;

  pivotConstraint: Matter.Constraint;
  controlConstraint: Matter.Constraint;

  constructor(
    controller: Hedgehog,
    port: number,
    // the body to which the servo arm is anchored
    anchor: Matter.Body,
    // the pose, relative to the anchor, where the arm's pivot point is located
    pivotAnchor: Pose,
    // the body representing the servo arm
    arm: Matter.Body,
    // the pose, relative to the arm, where the arm's pivot point is located
    pivotArm: Pose,
    // the distance from the pivot constraint at which the control constraint attaches to the bodies
    length: number,
  ) {
    this.controller = controller;
    this.port = port;
    this.anchor = anchor;
    this.pivotAnchor = pivotAnchor;
    this.arm = arm;
    this.pivotArm = pivotArm;
    this.length = length;

    this.pivotConstraint = Matter.Constraint.create({
      bodyA: anchor,
      pointA: poseToPoint(pivotAnchor),
      bodyB: arm,
      pointB: poseToPoint(pivotArm),
      length: 0,
      render: { visible: false },
    });

    const translation = { x: length, y: 0, angle: 0 };
    this.controlConstraint = Matter.Constraint.create({
      bodyA: anchor,
      pointA: poseToPoint(transform(pivotAnchor, translation)),
      bodyB: arm,
      pointB: poseToPoint(transform(pivotArm, translation)),
      length: 0,
      render: { visible: false },
    });
  }

  beforeUpdate() {
    const position = this.controller.getServo(this.port);
    if (position !== null) {
      // position 0..=1000 should be translated into angle -90°..=90°
      // 0..=1000 -> -500..=500 -> -1/2..=1/2 -> PI/2..=PI/2
      const dAngle = ((position - 500) / 1000) * Math.PI;

      // the anchor pivot point rotated by dAngle
      const pivotAnchor = { ...this.pivotAnchor, angle: this.pivotAnchor.angle + dAngle };

      const translation = { x: this.length, y: 0, angle: 0 };
      const pointA = poseToPoint(transform(pivotAnchor, translation));

      this.controlConstraint.pointA = pointA;
    }
  }
}
