/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Matter from 'matter-js';

import s from './Simulator.css';

class Robot {
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
      density: 1,
      frictionAir: 1,
    };

    this.leftWheel = Matter.Bodies.circle(
      ...translate(x, y, 20, -50),
      10,
      material,
    );
    this.rightWheel = Matter.Bodies.circle(
      ...translate(x, y, 20, 50),
      10,
      material,
    );
    this.body = Matter.Bodies.rectangle(x, y, 100, 70, {
      angle,
    });
    this.bot = Matter.Composite.create({
      parts: [this.leftWheel, this.rightWheel, this.body],
      constraints: [
        Matter.Constraint.create({
          bodyA: this.leftWheel,
          bodyB: this.body,
          pointB: translateVec(0, 0, 40, 0),
        }),
        Matter.Constraint.create({
          bodyA: this.leftWheel,
          bodyB: this.body,
          pointB: translateVec(0, 0, -40, 0),
        }),
        Matter.Constraint.create({
          bodyA: this.rightWheel,
          bodyB: this.body,
          pointB: translateVec(0, 0, 40, 0),
        }),
        Matter.Constraint.create({
          bodyA: this.rightWheel,
          bodyB: this.body,
          pointB: translateVec(0, 0, -40, 0),
        }),
      ],
    });

    this.parts = [...this.bot.parts, this.bot];

    this.leftSpeed = 0;
    this.rightSpeed = 0;
  }

  static applyForce(body, force, cos, sin) {
    Matter.Body.applyForce(body, body.position, {
      x: force * cos,
      y: force * sin,
    });
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

  constructor(props) {
    super(props);
    this.state = {};

    this.elementRef = React.createRef();
    this.createMatter();
  }

  componentDidMount() {
    this.mountMatter();
    this.startMatter();
  }

  componentWillUnmount() {
    this.stopMatter();
    this.unmountMatter();
  }

  createMatter() {
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;

    this.robot = new Robot({ x: 400, y: 150, angle: 0 });
    this.robot.leftSpeed = 100;
    this.robot.rightSpeed = 50;

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
    setTimeout(() => {
      this.robot.leftSpeed = 0;
      this.robot.rightSpeed = 0;
    }, 2000);
    setTimeout(() => {
      this.stopMatter();
    }, 3000);
    Matter.Runner.run(this.runner, this.engine);
    Matter.Render.run(this.renderer);
  }

  stopMatter() {
    Matter.Runner.stop(this.runner);
    Matter.Render.stop(this.renderer);
  }

  // eslint-disable-next-line class-methods-use-this
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
