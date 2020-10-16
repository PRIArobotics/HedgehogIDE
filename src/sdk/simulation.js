// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import { type TaskHandle } from '../components/ide/Executor/Executor';
import baseEmit from './base';
// <GSL customizable: simulation-imports>
import { type SimulatorType } from '../components/ide/Simulator';
import { schema } from '../components/ide/Simulator/simulation';
import Executor from '../components/ide/Executor';
// </GSL customizable: simulation-imports>

export default async function init(executor: Executor, getSimulator: () => Promise<SimulatorType>) {
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

  async function add(objects: schema.Object[]) {
    // <GSL customizable: simulation-body-add>
    const simulation = (await getSimulator()).simulation;
    simulation.jsonAdd(objects, true);
    // </GSL customizable: simulation-body-add>
  }

  async function remove(labels: string[]) {
    // <GSL customizable: simulation-body-remove>
    const simulation = (await getSimulator()).simulation;
    simulation.removeBodies(labels);
    // </GSL customizable: simulation-body-remove>
  }

  return {
    // <GSL customizable: simulation-extra-return>
    // Space for extra exports
    simulatorAdded,
    // </GSL customizable: simulation-extra-return>
    emit,
    handlers: {
      'simulation_add': ({ objects }: { objects: schema.Object[] }) => add(objects),
      'simulation_remove': ({ labels }: { labels: string[] }) => remove(labels),
    },
  };
}
