// @flow

import type { Translation, Rotation, RenderColor, RenderSprite } from './settings';

export type TouchSensor = {
  type: 'touch',
  port: number,
  objects: Object[],
};

export type RobotPart = TouchSensor;

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
