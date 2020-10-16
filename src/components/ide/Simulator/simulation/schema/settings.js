// @flow

import type { Point } from './misc';

export type Translation = {|
  position: Point,
|};

export type Rotation = {|
  angle: number,
|};

export type RenderColor = {|
  fillStyle?: string,
|};

export type RenderVisibility = {|
  opacity?: number,
  visible?: boolean,
|};

export type RenderSprite = {|
  sprite?: {
    texture?: string,
  },
|};

export type Static = {|
  isStatic?: boolean,
|};

export type Sensor = {|
  isSensor?: boolean,
|};

export type Line = {|
  plugin?: {
    hedgehog: {
      isLine?: boolean,
    },
  },
|};

export type Density = {|
  density?: number,
|};

export type FrictionAir = {|
  frictionAir?: number,
|};

export type Label = {|
  label?: string,
|};
