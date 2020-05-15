// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import {
  TerminateIcon,
  ResetIcon,
  TerminateAndResetIcon,
} from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import ExecutionAction from '../Ide';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './Simulator.scss';

import { Simulation } from './Simulation';

type Props = {|
  width: number,
  height: number,
  onExecutionAction: (action: ExecutionAction) => void | Promise<void>,
  running: boolean,
|};
type Instance = {|
  simulation: Simulation,
|};

function Simulator(
  { width, height, onExecutionAction, running }: Props,
  ref: Ref<Instance>,
) {
  const simulation = hooks.useValue(() => {
    const sim = new Simulation();
    sim.jsonInit({
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
    return sim;
  });

  // mount simulator in the target and simulate continuously
  const [renderTarget, setRenderTarget] = React.useState<HTMLDivElement | null>(
    null,
  );
  React.useEffect(() => {
    if (renderTarget === null) return undefined;

    simulation.mount(renderTarget, width, height);
    simulation.startMatter();
    simulation.startRender();
    return () => {
      simulation.stopRender();
      simulation.stopMatter();
      simulation.unmount();
    };
  }, [renderTarget, simulation, width, height]);

  React.useImperativeHandle(ref, () => ({ simulation }));

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
