// @flow

import type { Translation, Rotation, RenderColor, RenderSprite } from './settings';

export type LineSensor = {
  type: 'line',
  port: number,
  objects: Object[],
};

export type TouchSensor = {
  type: 'touch',
  port: number,
  objects: Object[],
};

export type DistanceSensor = {
  type: 'distance',
  port: number,
  objects: Object[],
};

export type RobotPart = LineSensor | TouchSensor | DistanceSensor;

export type RobotConfig = {|
  ...Translation,
  ...Rotation,
  parts: RobotPart[],
  render?: {
    ...RenderColor,
    ...RenderSprite,
  },
|};

export type Robot = {|
  type: 'robot',
  name: string,
  ...RobotConfig,
|};
