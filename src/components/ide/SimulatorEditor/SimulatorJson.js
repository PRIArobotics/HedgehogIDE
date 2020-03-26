// @flow

type Point = { x: number, y: number };

type Translation = {
  position?: Point,
};

type Rotation = {
  angle?: number,
};

type Color = {
  color?: string,
};

type Static = {
  static?: boolean,
};

type Sensor = {
  sensor?: boolean,
};

type Density = {
  density?: number,
};

type FrictionAir = {
  frictionAir?: number,
};

type RobotProps = {
  ...Translation,
  ...Rotation,
  ...Color,
};

type AllProps = {
  ...RobotProps,
  ...Static,
  ...Sensor,
  ...Density,
  ...FrictionAir,
};

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
