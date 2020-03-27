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
import * as SimulationSchema from '../SimulatorEditor/SimulationSchema';

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
  }

  componentDidMount() {
    this.props.forwardedRef.current = this;

    // eslint-disable-next-line no-throw-literal
    if (this.renderTargetRef.current === null) throw 'ref is null';

    const { width, height } = this.props;
    this.simulation.mount(this.renderTargetRef.current, width, height);
    this.initSimulation();

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
    this.robots.clear();
    this.simulation.clear(false);

    {
      const {
        center: { x, y },
        width,
        height,
      } = json.simulation;
      this.simulation.lookAt({
        min: { x: x - width / 2, y: y - height / 2 },
        max: { x: x + width / 2, y: y + height / 2 },
      });
    }

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
          const {
            type,
            name,
            position: { x, y },
            angle,
            ...options
          } = object;
          const robot = new Robot();
          const pose = { x, y, angle };
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
    this.initSimulationJson({
      simulation: {
        center: {
          x: 0,
          y: 0,
        },
        width: 600,
        height: 400,
      },
      objects: [
        {
          type: 'rectangle',
          width: 600,
          height: 6,
          position: {
            x: 0,
            y: -197,
          },
          angle: 0,
          isStatic: true,
          render: {
            fillStyle: '#666666',
          },
        },
        {
          type: 'rectangle',
          width: 600,
          height: 6,
          position: {
            x: 0,
            y: 197,
          },
          angle: 0,
          isStatic: true,
          render: {
            fillStyle: '#666666',
          },
        },
        {
          type: 'rectangle',
          width: 6,
          height: 400,
          position: {
            x: -297,
            y: 0,
          },
          angle: 0,
          isStatic: true,
          render: {
            fillStyle: '#666666',
          },
        },
        {
          type: 'rectangle',
          width: 6,
          height: 400,
          position: {
            x: 297,
            y: 0,
          },
          angle: 0,
          isStatic: true,
          render: {
            fillStyle: '#666666',
          },
        },
        {
          type: 'rectangle',
          width: 13,
          height: 113,
          position: {
            x: -100,
            y: -50,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 13,
          height: 113,
          position: {
            x: 0,
            y: -50,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 13,
          height: 113,
          position: {
            x: 200,
            y: -50,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 13,
          height: 113,
          position: {
            x: -200,
            y: 50,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 13,
          height: 113,
          position: {
            x: 0,
            y: 50,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: -150,
            y: -100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: -50,
            y: -100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: 50,
            y: -100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: 150,
            y: -100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: -150,
            y: 100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: -50,
            y: 100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: 50,
            y: 100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'rectangle',
          width: 113,
          height: 13,
          position: {
            x: 150,
            y: 100,
          },
          angle: 0,
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: '#000000',
          },
        },
        {
          type: 'robot',
          name: 'hedgehog',
          position: {
            x: -200,
            y: -100,
          },
          angle: 0,
          isStatic: true,
        },
      ],
    });
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
