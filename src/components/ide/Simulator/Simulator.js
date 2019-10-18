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

type PropTypes = {|
  forwardedRef: React.RefObject,
  width: number,
  height: number,
|};
type StateTypes = {||};

class Simulator extends React.Component<PropTypes, StateTypes> {
  engine: Matter.Engine;
  runner: Matter.Runner;
  robot: Robot;

  renderTargetRef: React.RefObject = React.createRef();
  renderer: Matter.Render | null = null;

  constructor(props) {
    super(props);
    this.createMatter();
  }

  componentDidMount() {
    this.props.forwardedRef.current = this;
    this.mountMatter();
    this.startMatter();
  }

  componentWillUnmount() {
    this.stopMatter();
    this.unmountMatter();
    this.props.forwardedRef.current = null;
  }

  createMatter() {
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;

    this.robot = new Robot({ x: 100, y: 100, angle: 0 });

    const box = Matter.Bodies.rectangle(300, 150, 60, 60, {
      density: 0.1,
      frictionAir: 0.2,
    });

    const { width, height } = this.props;

    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(width / 2, 6, width - 20, 8, {
        isStatic: true,
      }),
      Matter.Bodies.rectangle(width / 2, height - 6, width - 20, 8, {
        isStatic: true,
      }),
      Matter.Bodies.rectangle(6, height / 2, 8, height - 20, {
        isStatic: true,
      }),
      Matter.Bodies.rectangle(width - 6, height / 2, 8, height - 20, {
        isStatic: true,
      }),
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
    const { width, height } = this.props;

    this.renderer = Matter.Render.create({
      element: this.renderTargetRef.current,
      engine: this.engine,
      options: { width, height },
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
          <div className={s.canvas} ref={this.renderTargetRef} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Simulator);
