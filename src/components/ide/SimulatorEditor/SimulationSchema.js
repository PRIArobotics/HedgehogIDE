// @flow

import { type Point } from '../Simulator/simulation';

type Translation = {|
  position: Point,
|};

type Rotation = {|
  angle: number,
|};

type RenderColor = {|
  fillStyle?: string,
|};

type RenderVisibility = {|
  opacity?: number,
  visible?: boolean,
|};

type RenderSprite = {|
  sprite?: {
    texture?: string,
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

export type RobotProps = {|
  ...Translation,
  ...Rotation,
  render?: {
    ...RenderColor,
    ...RenderSprite,
  },
|};

type AllProps = {|
  ...RobotProps,
  render?: {
    ...RenderColor,
    ...RenderVisibility,
    ...RenderSprite,
  },
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

export type Svg = {
  type: 'svg',
  src: string,
  scale: number,
  granularity: number,
  ...AllProps,
};

export type TouchSensor = {
  type: 'touch',
  port: number,
  objects: Object[],
};

export type RobotPart = TouchSensor;

export type Robot = {
  type: 'robot',
  name: string,
  ...RobotProps,
  parts: RobotPart[],
};

export type Simulation = {
  center: Point,
  width: number,
  height: number,
};

export type Object = Rectangle | Circle | Svg | Robot;

export type SimulatorJson = {
  simulation: Simulation,
  objects: Object[],
};
