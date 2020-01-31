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
  robots: Map<string, Robot> = new Map<string, Robot>();

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
      min: { x: -width / 2, y: -height / 2 },
      max: { x: width / 2, y: height / 2 },
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
    robot.setPose({ x: -200, y: -100, angle: 0 });

    const lineOptions = {
      isSensor: true,
      isStatic: true,
      render: {
        fillStyle: '#000000',
      },
    };

    const wLine = 13;
    const lLine = 100 + wLine;

    const lines = [
      Matter.Bodies.rectangle(-150, -100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(-50, -100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(50, -100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(150, -100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(-100, -50, wLine, lLine, lineOptions),
      Matter.Bodies.rectangle(0, -50, wLine, lLine, lineOptions),
      Matter.Bodies.rectangle(200, -50, wLine, lLine, lineOptions),
      Matter.Bodies.rectangle(-200, 50, wLine, lLine, lineOptions),
      Matter.Bodies.rectangle(0, 50, wLine, lLine, lineOptions),
      Matter.Bodies.rectangle(-150, 100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(-50, 100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(50, 100, lLine, wLine, lineOptions),
      Matter.Bodies.rectangle(150, 100, lLine, wLine, lineOptions),
    ];

    const { width, height } = this.props;

    const boundsOptions = {
      isStatic: true,
      render: {
        fillStyle: '#666677',
      },
    };

    this.simulation.add([
      Matter.Bodies.rectangle(0, -height / 2 + 3, width, 6, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(0, height / 2 - 3, width, 6, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(-width / 2 + 3, 0, 6, height, {
        ...boundsOptions,
      }),
      Matter.Bodies.rectangle(width / 2 - 3, 0, 6, height, {
        ...boundsOptions,
      }),
      ...lines,
      ...robot.bodies,
    ]);

    this.simulation.lines.push(...lines);
    this.simulation.robots.push(robot);
    this.simulation.updateRobots();
    this.robots.set('hedgehog', robot);
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
