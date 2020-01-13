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

    const lineOptions = {
      isSensor: true,
      isStatic: true,
      render: {
        fillStyle: '#000000',
      },
    };

    const lines = [
      Matter.Bodies.rectangle(150, 100, 116, 16, lineOptions),
      Matter.Bodies.rectangle(250, 100, 116, 16, lineOptions),
      Matter.Bodies.rectangle(350, 100, 116, 16, lineOptions),
      Matter.Bodies.rectangle(450, 100, 116, 16, lineOptions),
      Matter.Bodies.rectangle(200, 150, 16, 116, lineOptions),
      Matter.Bodies.rectangle(300, 150, 16, 116, lineOptions),
      Matter.Bodies.rectangle(500, 150, 16, 116, lineOptions),
      Matter.Bodies.rectangle(100, 250, 16, 116, lineOptions),
      Matter.Bodies.rectangle(300, 250, 16, 116, lineOptions),
      Matter.Bodies.rectangle(150, 300, 116, 16, lineOptions),
      Matter.Bodies.rectangle(250, 300, 116, 16, lineOptions),
      Matter.Bodies.rectangle(350, 300, 116, 16, lineOptions),
      Matter.Bodies.rectangle(450, 300, 116, 16, lineOptions),
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
