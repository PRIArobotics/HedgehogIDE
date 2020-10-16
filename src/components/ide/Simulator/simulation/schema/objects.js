// @flow

import type {
  Translation,
  Rotation,
  RenderColor,
  RenderVisibility,
  RenderSprite,
  Static,
  Sensor,
  Line,
  Density,
  FrictionAir,
  Label,
} from './settings';

type ObjectConfig = {|
  ...Translation,
  ...Rotation,
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
  ...ObjectConfig,
};

export type Circle = {
  type: 'circle',
  radius: number,
  ...ObjectConfig,
};

export type Svg = {
  type: 'svg',
  src: string,
  scale: number,
  granularity: number,
  ...ObjectConfig,
};

export type Object = Rectangle | Circle | Svg;
