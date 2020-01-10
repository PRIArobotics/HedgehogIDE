// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Matter from 'matter-js';

import s from './Simulator.scss';

import { Robot, Simulation } from './Simulation';

type PropTypes = {|
  // eslint-disable-next-line no-use-before-define
  forwardedRef: RefObject<typeof Simulator>,
  width: number,
  height: number,
|};
type StateTypes = {||};

class Simulator extends React.Component<PropTypes, StateTypes> {
  simulation: Simulation;
  robot: Robot;

  renderTargetRef: RefObject<'div'> = React.createRef();

  constructor(props) {
    super(props);
    this.simulation = new Simulation();
    this.initSimulation();
  }

  componentDidMount() {
    this.props.forwardedRef.current = this;

    // eslint-disable-next-line no-throw-literal
    if (this.renderTargetRef.current === null) throw 'ref is null';

    const { width, height } = this.props;
    this.simulation.mount(this.renderTargetRef.current, width, height);
    this.simulation.lookAt({
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });

    this.simulation.startMatter();
    this.simulation.startRender();
  }

  componentWillUnmount() {
    this.simulation.stopRender();
    this.simulation.stopMatter();
    this.simulation.unmount();
    this.props.forwardedRef.current = null;
  }

  initSimulation() {
    const robot = new Robot();
    robot.setPose({ x: 100, y: 100, angle: 0 });

    const box = Matter.Composites.softBody(
      // x/y, rows/cols, r/c gaps, cross brace, particle radius
      ...[275, 75, 6, 6, 0, 0, true, 5],
      {
        inertia: undefined,
        density: 0.2,
        frictionAir: 0.3,
        render: {
          fillStyle: '#995544',
          // sprite: {
          //   texture: '/icon.png',
          // },
        },
      },
      {
        stiffness: 0.8,
        render: { visible: false },
      },
    );

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

    this.simulation.add([
      Matter.Bodies.rectangle(width / 2, 3, width, 6, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(width / 2, height - 3, width, 6, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(3, height / 2, 6, height, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(width - 3, height / 2, 6, height, {
        ...boundsOptions,
      }),
      ...lines,
      ...robot.bodies,
      box,
    ]);

    this.simulation.lines.push(...lines);
    this.simulation.robots.push(robot);
    this.robot = robot;
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
