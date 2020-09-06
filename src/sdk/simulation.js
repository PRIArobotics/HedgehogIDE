// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import { type TaskHandle } from '../components/ide/Executor/Executor';
import baseEmit from './base';
// <GSL customizable: simulation-imports>
import { type SimulatorType } from '../components/ide/Simulator';
import Executor from '../components/ide/Executor';
// </GSL customizable: simulation-imports>

export default async function init(executor: Executor) {
  // <GSL customizable: simulation-init>
  // Your module initialization code
  function simulatorAdded(simulator: SimulatorType) {
    simulator.simulation.addSensorHandler((eventName, bodyA, bodyB) => {
      emit(executor, 'collision', { bodyA, bodyB });
      emit(executor, `collision_${bodyA.label}`, { bodyA, bodyB });
      emit(executor, `collision_${bodyB.label}`, { bodyA: bodyB, bodyB: bodyA });
    });
  }
  // </GSL customizable: simulation-init>

  const emit = baseEmit.bind(null, 'simulation');

  return {
    // <GSL customizable: simulation-extra-return>
    // Space for extra exports
    simulatorAdded,
    // </GSL customizable: simulation-extra-return>
    emit,
    handlers: {
    },
  };
}
