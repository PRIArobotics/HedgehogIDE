// @flow

import { type Point } from '../Simulator/Simulation';

type Translation = {|
  position: Point,
|};

type Rotation = {|
  angle: number,
|};

type Color = {|
  render?: {
    fillStyle?: string,
  },
|};

type Static = {|
  isStatic?: boolean,
|};

type Sensor = {|
  isSensor?: boolean,
|};

type Density = {|
  density?: number,
|};

type FrictionAir = {|
  frictionAir?: number,
|};

type Label = {|
  label?: string,
|};

type RobotProps = {|
  ...Translation,
  ...Rotation,
  ...Color,
|};

type AllProps = {|
  ...RobotProps,
  ...Static,
  ...Sensor,
  ...Density,
  ...FrictionAir,
  ...Label,
|};

export type Rectangle = {
  type: 'rectangle',
  width: number,
  height: number,
  ...AllProps,
};

export type Circle = {
  type: 'circle',
  radius: number,
  ...AllProps,
};

export type Robot = {
  type: 'robot',
  name: string,
  ...RobotProps,
};

export type Simulation = {
  center: Point,
  width: number,
  height: number,
};

export type SimulatorJson = {
  simulation: Simulation,
  objects: (Rectangle | Circle | Robot)[],
};
