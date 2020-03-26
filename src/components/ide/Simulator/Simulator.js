// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Matter from 'matter-js';

import { ResetIcon } from '../../misc/palette';

import ColoredIconButton from '../../misc/ColoredIconButton';
import ToolBar from '../ToolBar';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './Simulator.scss';

import { Robot, Simulation } from './Simulation';
import * as SimulationSchema from '../SimulatorEditor/SimulatorJson';

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

  initSimulationJson(json: SimulationSchema.SimulatorJson) {
    // TODO width and height are props and can't be set in here
    // this also means no reason to access the canvas here

    // // eslint-disable-next-line no-throw-literal
    // if (this.renderTargetRef.current === null) throw 'ref is null';

    this.robots.clear();
    this.simulation.clear(false);

    // {
    //   const {
    //     center: { x, y },
    //     width,
    //     height,
    //   } = json.simulation;
    //   this.simulation.lookAt({
    //     min: { x: x - width / 2, y: y - height / 2 },
    //     max: { x: x + width / 2, y: y + height / 2 },
    //   });
    // }

    json.objects.forEach(object => {
      switch (object.type) {
        case 'rectangle': {
          const { type, width, height, ...options } = object;
          const body = Matter.Bodies.rectangle(0, 0, width, height, options);

          this.simulation.add([body]);
          break;
        }
        case 'circle': {
          const { type, radius, ...options } = object;
          const body = Matter.Bodies.circle(0, 0, radius, options);

          this.simulation.add([body]);
          break;
        }
        case 'robot': {
          const { type, name, ...options } = object;
          const robot = new Robot();
          const pose = {
            ...options.position,
            angle: options.angle,
          };
          robot.setPose(pose);
          robot.setInitialPose(pose);
          // TODO color

          this.robots.set(name, robot);
          this.simulation.add(robot.bodies);
          this.simulation.robots.push(robot);
          break;
        }
        default:
          console.warn('unknown simulation object:', object);
      }
    });

    this.simulation.updateRobots();
  }

  initSimulation() {
    const robot = new Robot();
    const robotPose = { x: -200, y: -100, angle: 0 };
    robot.setPose(robotPose);
    robot.setInitialPose(robotPose);

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
        <ToolBar>
          <ToolBarItem>
            <ColoredIconButton
              onClick={() => this.simulation.reset()}
              disableRipple
            >
              <ResetIcon />
            </ColoredIconButton>
          </ToolBarItem>
        </ToolBar>
      </div>
    );
  }
}

export default withStyles(s)(Simulator);
