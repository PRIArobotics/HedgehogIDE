// @flow

import { type Point } from '../Simulator/simulation';

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

type Visibility = {|
  render?: {
    opacity?: number,
    visible?: boolean,
  },
|};

type Sprite = {|
  render?: {
    sprite?: {
      texture: string,
    },
  },
|};

type Static = {|
  isStatic?: boolean,
|};

type Sensor = {|
  isSensor?: boolean,
|};

type Line = {|
  plugin?: {
    hedgehog: {
      isLine?: boolean,
    },
  },
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
  ...Visibility,
  ...Sprite,
  ...Static,
  ...Sensor,
  ...Line,
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

export type Object = Rectangle | Circle | Robot;

export type SimulatorJson = {
  simulation: Simulation,
  objects: Object[],
};
