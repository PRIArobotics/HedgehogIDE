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

import { generateConfigFromXml } from '../SimulatorEditor';
// $FlowExpectError
import defaultSimulationXml from './default_simulation.xml';

const defaultSimulationConfig = generateConfigFromXml(defaultSimulationXml);

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
      sim.jsonInit(defaultSimulationConfig);
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
        <div className={`${s.container} ${s.fit}`}>
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
        </ToolBar>
      </div>
    );
  },
);

export type SimulatorType = React.ElementRef<typeof Simulator>;
export default Simulator;
