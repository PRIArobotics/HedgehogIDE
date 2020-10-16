// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import {
  TerminateIcon,
  ResetIcon,
  TerminateAndResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import { type ExecutionAction } from '../Ide';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './Simulator.scss';

import { Simulation } from './simulation';

type Props = {|
  running: boolean,
  onExecutionAction: (action: ExecutionAction) => void | Promise<void>,
|};
type Instance = {|
  simulation: Simulation,
|};

/**
 * The simulator displays a 2D environment containing a simulated robot.
 *
 * Besides the simulation itself, the toolbar allows terminating programs and resetting the simulation.
 */
const Simulator = React.forwardRef<Props, Instance>(
  ({ onExecutionAction, running }: Props, ref: Ref<Instance>) => {
    const simulation = hooks.useValue(() => {
      const sim = new Simulation();
      sim.jsonInit({
        center: {
          x: 0,
          y: 0,
        },
        width: 600,
        height: 400,
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
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
            plugin: {
              hedgehog: {
                isLine: true,
              },
            },
            render: {
              fillStyle: '#000000',
            },
          },
          {
            type: 'robot',
            name: 'hedgehog',
            parts: [],
            position: {
              x: -200,
              y: -100,
            },
            angle: 0,
            isStatic: true,
          },
        ],
      });
      return sim;
    });

    // mount simulator in the target and simulate continuously
    const [renderTarget, setRenderTarget] = React.useState<HTMLCanvasElement | null>(null);
    React.useEffect(() => {
      if (renderTarget === null) return undefined;

      simulation.mount(renderTarget);
      simulation.startMatter();
      simulation.startRender();
      return () => {
        simulation.stopRender();
        simulation.stopMatter();
        simulation.unmount();
      };
    }, [renderTarget, simulation]);

    // Need to use a dependency array here, because Ide requires a stable ref.
    // On each change to the Simulator ref, jsonInit is potentially called.
    React.useImperativeHandle(ref, () => ({ simulation }), [simulation]);

    useStyles(s);
    return (
      <div className={s.root}>
        <div className={s.container}>
          <canvas className={s.canvas} ref={setRenderTarget} />
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
          <ToolBarItem>
            <ToolBarIconButton onClick={() => {}} icon={ZoomInIcon} disableRipple />
          </ToolBarItem>
          <ToolBarItem>
            <ToolBarIconButton onClick={() => {}} icon={ZoomOutIcon} disableRipple />
          </ToolBarItem>
        </ToolBar>
      </div>
    );
  },
);

export type SimulatorType = React.ElementRef<typeof Simulator>;
export default Simulator;
