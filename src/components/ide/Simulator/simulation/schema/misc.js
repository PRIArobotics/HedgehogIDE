// @flow

export type Point = {|
  x: number,
  y: number,
|};

export type Pose = {|
  ...Point,
  angle: number,
|};
