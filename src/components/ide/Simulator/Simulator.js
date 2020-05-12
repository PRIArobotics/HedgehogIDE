// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import Matter from 'matter-js';

import {
  TerminateIcon,
  ResetIcon,
  TerminateAndResetIcon,
} from '../../misc/palette';

import ExecutionAction from '../Ide';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './Simulator.scss';

import { Robot, Simulation } from './Simulation';
import * as SimulationSchema from '../SimulatorEditor/SimulationSchema';

type Props = {|
  width: number,
  height: number,
  onExecutionAction: (action: ExecutionAction) => void | Promise<void>,
  running: boolean,
|};
type Instance = {|
  simulation: Simulation,
  robots: Map<string, Robot>,
  reset: () => void,
  initSimulationJson: (schema: SimulationSchema.SimulatorJson) => void,
|};

// similar to useMemo, but without dependencies, and guarantees that the same
// instance is preserved. The initialization is eager, i.e. happens on the
// first hook call.
function useValue<T>(init: () => T): T {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) ref.current = init();
  return ref.current;
}

function Simulator(
  { width, height, onExecutionAction, running }: Props,
  ref: Ref<Instance>,
) {
  const [simulation, robots] = useValue(() => [
    new Simulation(),
    new Map<string, Robot>(),
  ]);

  const initSimulationJson = (schema: SimulationSchema.SimulatorJson) => {
    robots.clear();
    simulation.clear(false);

    {
      const {
        center: { x, y },
        width,
        height,
      } = schema.simulation;
      simulation.lookAt({
        min: { x: x - width / 2, y: y - height / 2 },
        max: { x: x + width / 2, y: y + height / 2 },
      });
    }

    schema.objects.forEach(object => {
      switch (object.type) {
        case 'rectangle': {
          const { type, width, height, ...options } = object;
          const body = Matter.Bodies.rectangle(0, 0, width, height, options);

          simulation.add([body]);
          // TODO with this, being a sensor (non-colliding)
          // and being a line (dark surface) re the same thing
          if (options.isSensor) simulation.lines.push(body);
          break;
        }
        case 'circle': {
          const { type, radius, ...options } = object;
          const body = Matter.Bodies.circle(0, 0, radius, options);

          simulation.add([body]);
          // TODO with this, being a sensor (non-colliding)
          // and being a line (dark surface) re the same thing
          if (options.isSensor) simulation.lines.push(body);
          break;
        }
        case 'robot': {
          const {
            name,
            position: { x, y },
            angle,
            // color,
          } = object;
          const robot = new Robot();
          const pose = { x, y, angle };
          robot.setPose(pose);
          robot.setInitialPose(pose);
          // TODO color

          robots.set(name, robot);
          simulation.add(robot.bodies);
          simulation.robots.push(robot);
          break;
        }
        default:
          console.warn('unknown simulation object:', object);
      }
    });

    simulation.updateRobots();
  };

  const initSimulation = () => {
    initSimulationJson({
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
  };

  // mount simulator in the target and simulate continuously
  const [renderTarget, setRenderTarget] = React.useState<HTMLDivElement | null>(
    null,
  );
  React.useEffect(() => {
    if (renderTarget === null) return undefined;

    simulation.mount(renderTarget, width, height);
    initSimulation();
    simulation.startMatter();
    simulation.startRender();
    return () => {
      simulation.stopRender();
      simulation.stopMatter();
      simulation.unmount();
    };
  }, [renderTarget]);

  React.useImperativeHandle(ref, () => ({
    simulation,
    robots,
    reset: () => simulation.reset(),
    initSimulationJson,
  }));

  useStyles(s);
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.canvas} ref={setRenderTarget} />
      </div>
      <ToolBar>
        {running ? (
          <ToolBarItem key="terminate-and-reset">
            <ToolBarIconButton
              onClick={() => {
                onExecutionAction({ action: 'TERMINATE', reset: true });
              }}
              icon={TerminateAndResetIcon}
              color="red"
              disableRipple
            />
          </ToolBarItem>
        ) : (
          <ToolBarItem key="reset">
            <ToolBarIconButton
              onClick={() => {
                onExecutionAction({ action: 'RESET' });
              }}
              icon={ResetIcon}
              disableRipple
            />
          </ToolBarItem>
        )}
        <ToolBarItem>
          <ToolBarIconButton
            onClick={() => {
              onExecutionAction({ action: 'TERMINATE', reset: false });
            }}
            icon={TerminateIcon}
            color="red"
            disableRipple
            disabled={!running}
          />
        </ToolBarItem>
      </ToolBar>
    </div>
  );
}

export default React.forwardRef<Props, Instance>(Simulator);
