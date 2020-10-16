// @flow

import type { Translation, Rotation, RenderColor, RenderSprite } from './settings';

export type RobotProps = {|
  ...Translation,
  ...Rotation,
  render?: {
    ...RenderColor,
    ...RenderSprite,
  },
|};

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
