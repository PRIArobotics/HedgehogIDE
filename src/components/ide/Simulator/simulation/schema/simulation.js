// @flow

import type { Point } from './misc';
import type { Object } from './objects';
import type { Robot } from './robot';

export type Simulation = {
  center: Point,
  width: number,
  height: number,
  objects: (Object | Robot)[],
};
