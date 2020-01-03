// @flow

import Matter from 'matter-js';

type Point = {|
  x: number,
  y: number,
|};

type Pose = {|
  x: number,
  y: number,
  angle: number,
|};

export class Robot {
  leftWheel: Matter.Body;
  rightWheel: Matter.Body;
  surfaceSensors: Array<Matter.Body>;
  body: Matter.Body;

  leftSpeed: number = 0;
  rightSpeed: number = 0;

  constructor(pose: Pose) {
    const { x, y, angle } = pose;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const translate = (_x, _y, dx, dy) => [
      _x + dx * cos - dy * sin,
      _y + dx * sin + dy * cos,
    ];

    const material = {
      density: 0.3,
      frictionAir: 0.4,
    };
    const wheelStyle = {
      render: {
        fillStyle: '#777777',
      },
    };
    const bodyStyle = {
      render: {
        fillStyle: '#38b449',
        // sprite: {
        //   texture: '/icon.png',
        // },
      },
    };
    const sensorStyle = {
      render: {
        fillStyle: '#777777',
      },
    };

    this.leftWheel = Matter.Bodies.rectangle(
      ...translate(x, y, 20, -50),
      ...[30, 20],
      { angle, ...material, ...wheelStyle },
    );
    this.rightWheel = Matter.Bodies.rectangle(
      ...translate(x, y, 20, 50),
      ...[30, 20],
      { angle, ...material, ...wheelStyle },
    );
    const body = Matter.Bodies.rectangle(
      ...translate(x, y, 0, 0),
      ...[100, 70],
      { angle, ...material, ...bodyStyle },
    );
    this.surfaceSensors = [
      Matter.Bodies.circle(
        ...translate(x, y, 49, -20),
        ...[4],
        { ...material, ...sensorStyle },
      ),
      Matter.Bodies.circle(
        ...translate(x, y, 50, 0),
        ...[4],
        { ...material, ...sensorStyle },
      ),
      Matter.Bodies.circle(
        ...translate(x, y, 49, 20),
        ...[4],
        { ...material, ...sensorStyle },
      ),
    ];
    this.body = Matter.Body.create({
      parts: [
        this.leftWheel,
        this.rightWheel,
        ...this.surfaceSensors,
        body,
      ],
      ...material,
    });
  }

  applyForce(pos: Point, force: number, cos: number, sin: number) {
    Matter.Body.applyForce(this.body, pos, {
      x: force * cos,
      y: force * sin,
    });
  }

  setSpeed(left: number, right: number) {
    this.leftSpeed = left;
    this.rightSpeed = right;
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

    this.applyForce(lPos, this.leftSpeed / 10, cos, sin);
    this.applyForce(rPos, this.rightSpeed / 10, cos, sin);
  }
}
