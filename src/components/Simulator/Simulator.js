/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Matter from 'matter-js';

import s from './Simulator.scss';

class Robot {
  leftWheel: Matter.Body;
  rightWheel: Matter.Body;
  body: Matter.Body;
  bot: Matter.Composite;

  parts: (Matter.Body | Matter.Composite)[];

  leftSpeed: number = 0;
  rightSpeed: number = 0;

  constructor(pose) {
    const { x, y, angle } = pose;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const translate = (_x, _y, dx, dy) => [
      _x + dx * cos - dy * sin,
      _y + dx * sin + dy * cos,
    ];
    const translateVec = (_x, _y, dx, dy) => {
      // eslint-disable-next-line no-shadow
      const [x, y] = translate(_x, _y, dx, dy);
      return { x, y };
    };

    const material = {
      density: 0.3,
      frictionAir: 0.4,
    };

    this.leftWheel = Matter.Bodies.rectangle(
      ...translate(x, y, 20, -50),
      ...[30, 20],
      { ...material },
    );
    this.rightWheel = Matter.Bodies.rectangle(
      ...translate(x, y, 20, 50),
      ...[30, 20],
      { ...material },
    );
    this.body = Matter.Bodies.rectangle(
      ...translate(x, y, 0, 0),
      ...[100, 70],
      { angle, ...material },
    );
    this.bot = Matter.Composite.create({
      parts: [this.leftWheel, this.rightWheel, this.body],
      constraints: [
        Matter.Constraint.create({
          bodyA: this.leftWheel,
          pointA: translateVec(0, 0, 0, -10),
          bodyB: this.body,
          pointB: translateVec(0, 0, 20, -60),
          render: { visible: false },
        }),
        Matter.Constraint.create({
          bodyA: this.leftWheel,
          pointA: translateVec(0, 0, 0, 10),
          bodyB: this.body,
          pointB: translateVec(0, 0, 20, -40),
          render: { visible: false },
        }),
        Matter.Constraint.create({
          bodyA: this.rightWheel,
          pointA: translateVec(0, 0, 0, -10),
          bodyB: this.body,
          pointB: translateVec(0, 0, 20, 40),
          render: { visible: false },
        }),
        Matter.Constraint.create({
          bodyA: this.rightWheel,
          pointA: translateVec(0, 0, 0, 10),
          bodyB: this.body,
          pointB: translateVec(0, 0, 20, 60),
          render: { visible: false },
        }),
      ],
    });

    this.parts = [...this.bot.parts, this.bot];
  }

  static applyForce(body, force, cos, sin) {
    Matter.Body.applyForce(body, body.position, {
      x: force * cos,
      y: force * sin,
    });
  }

  setSpeed(left: number, right: number) {
    this.leftSpeed = left;
    this.rightSpeed = right;
  }

  beforeUpdate() {
    const dx = this.leftWheel.position.x - this.rightWheel.position.x;
    const dy = this.leftWheel.position.y - this.rightWheel.position.y;
    const hypot = Math.hypot(dx, dy);

    // cosine and sine of the angle in which the forces are directed
    // this is normal to the axis of the wheels, therefore [-dy, dx] instead of [dx, dy]
    const cos = -dy / hypot;
    const sin = dx / hypot;

    Robot.applyForce(this.leftWheel, this.leftSpeed / 10, cos, sin);
    Robot.applyForce(this.rightWheel, this.rightSpeed / 10, cos, sin);
  }
}

class Simulator extends React.Component {
  static propTypes = {};

  state = {};

  engine: Matter.Engine;
  runner: Matter.Runner;
  robot: Robot;

  elementRef: React.RefObject = React.createRef();
  renderer: Matter.Render | null = null;

  constructor(props) {
    super(props);
    this.createMatter();
  }

  componentDidMount() {
    this.mountMatter();
    this.startMatter();

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    (async () => {
      await sleep(500);
      this.robot.setSpeed(100, 100);
      await sleep(500);
      this.robot.setSpeed(0, 0);
      await sleep(200);
      this.robot.setSpeed(70, -70);
      await sleep(300);
      this.robot.setSpeed(0, 0);
      await sleep(200);
      this.robot.setSpeed(100, 100);
      await sleep(500);
      this.stopMatter();
    })();
  }

  componentWillUnmount() {
    this.stopMatter();
    this.unmountMatter();
  }

  createMatter() {
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;

    this.robot = new Robot({ x: 400, y: 150, angle: 0 });

    const box = Matter.Bodies.rectangle(500, 200, 60, 60, {
      density: 0.1,
      frictionAir: 0.2,
    });

    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(500, 6, 980, 8, { isStatic: true }),
      Matter.Bodies.rectangle(500, 594, 980, 8, { isStatic: true }),
      Matter.Bodies.rectangle(6, 300, 8, 580, { isStatic: true }),
      Matter.Bodies.rectangle(994, 300, 8, 580, { isStatic: true }),
      ...this.robot.parts,
      box,
    ]);

    this.engine = engine;

    const runner = Matter.Runner.create();
    Matter.Events.on(runner, 'beforeUpdate', () => {
      this.robot.beforeUpdate();
    });

    this.runner = runner;
  }

  mountMatter() {
    this.renderer = Matter.Render.create({
      element: this.elementRef.current,
      engine: this.engine,
      options: {
        width: 1000,
        height: 600,
      },
    });
  }

  startMatter() {
    Matter.Runner.run(this.runner, this.engine);
    Matter.Render.run(this.renderer);
  }

  stopMatter() {
    Matter.Runner.stop(this.runner);
    Matter.Render.stop(this.renderer);
  }

  unmountMatter() {
    // TODO
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.canvas} ref={this.elementRef} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Simulator);
