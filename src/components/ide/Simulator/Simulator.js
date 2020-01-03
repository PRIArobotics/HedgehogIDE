// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Matter from 'matter-js';

import s from './Simulator.scss';

import { Robot } from './Simulation';

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
      this.robot.body,
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
