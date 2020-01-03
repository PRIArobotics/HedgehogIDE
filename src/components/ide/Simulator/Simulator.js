// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Matter from 'matter-js';

import s from './Simulator.scss';

class Robot {
  leftWheel: Matter.Body;
  rightWheel: Matter.Body;
  body: Matter.Body;
  surfaceSensors: Array<Matter.Body>;
  bot: Matter.Body;

  parts: Array<Matter.Body | Matter.Composite>;

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
    this.body = Matter.Bodies.rectangle(
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
    this.bot = Matter.Body.create({
      parts: [
        this.leftWheel,
        this.rightWheel,
        ...this.surfaceSensors,
        this.body,
      ],
      ...material,
    });

    this.parts = [...this.bot.parts, this.bot];
  }

  applyForce(pos, force, cos, sin) {
    Matter.Body.applyForce(this.bot, pos, {
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

type PropTypes = {|
  // eslint-disable-next-line no-use-before-define
  forwardedRef: RefObject<typeof Simulator>,
  width: number,
  height: number,
|};
type StateTypes = {||};

class Simulator extends React.Component<PropTypes, StateTypes> {
  engine: Matter.Engine;
  runner: Matter.Runner;
  robot: Robot;

  renderTargetRef: RefObject<'div'> = React.createRef();
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
    const world = Matter.World.create({
      gravity: { x: 0, y: 0 },
    });

    this.robot = new Robot({ x: 100, y: 100, angle: 0 });

    const box = Matter.Bodies.rectangle(300, 150, 60, 60, {
      density: 0.2,
      frictionAir: 0.4,
      render: {
        fillStyle: '#995544',
        // sprite: {
        //   texture: '/icon.png',
        // },
      },
    });

    const lineOptions = {
      isSensor: true,
      isStatic: true,
      render: {
        fillStyle: '#000000',
      },
    };

    const lines = [
      Matter.Bodies.rectangle(500, 200, 5, 305, lineOptions),
      Matter.Bodies.rectangle(350, 350, 305, 5, lineOptions),
    ];

    const { width, height } = this.props;

    const boundsOptions = {
      isStatic: true,
      render: {
        fillStyle: '#666677',
      },
    };

    Matter.World.add(world, [
      Matter.Bodies.rectangle(width / 2, 6, width - 20, 8, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(width / 2, height - 6, width - 20, 8, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(6, height / 2, 8, height - 20, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(width - 6, height / 2, 8, height - 20, {
        ...boundsOptions,
      }),
      ...lines,
      this.robot.bot,
      box,
    ]);

    this.engine = Matter.Engine.create({ world });
    Matter.Events.on(this.engine, 'collisionStart', event => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        let line;
        let other;
        if (lines.includes(bodyA)) {
          line = bodyA;
          other = bodyB;
        } else if (lines.includes(bodyB)) {
          line = bodyB;
          other = bodyA;
        } else return;

        // other is now a body, the one that collided with a line
        if (this.robot.surfaceSensors.includes(other)) {
          console.log('collision');
        }
      });
    });

    const runner = Matter.Runner.create();
    Matter.Events.on(runner, 'beforeUpdate', () => {
      this.robot.beforeUpdate();
    });

    this.runner = runner;
  }

  mountMatter() {
    const { width, height } = this.props;

    const renderer = Matter.Render.create({
      element: this.renderTargetRef.current,
      engine: this.engine,
      options: { width, height, wireframes: false, background: '#eeeeee' },
    });
    Matter.Render.lookAt(renderer, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });
    this.renderer = renderer;
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
