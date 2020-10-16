// @flow

import type { Point } from './misc';
import type { Object } from './objects';

export type Simulation = {
  center: Point,
  width: number,
  height: number,
};

export type SimulatorJson = {
  simulation: Simulation,
  objects: Object[],
};
