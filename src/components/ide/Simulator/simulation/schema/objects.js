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

type AllProps = {|
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

export type Object = Rectangle | Circle | Svg;
