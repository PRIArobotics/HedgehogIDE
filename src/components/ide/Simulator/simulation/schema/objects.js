// @flow

import Matter from 'matter-js';

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
import { resolveSprite, setInitialPose, setTemporary } from './helpers';

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

export function createBody(
  config: Object,
  assets: Map<string, [string, Uint8Array]> | null = null,
  temporary: boolean = false,
): Matter.Body {
  let body;

  switch (config.type) {
    case 'rectangle': {
      // eslint-disable-next-line no-shadow
      const { type: _type, width, height, ...options } = config;
      resolveSprite(options?.render?.sprite);

      body = Matter.Bodies.rectangle(0, 0, width, height, options);
      break;
    }
    case 'circle': {
      const { type: _type, radius, ...options } = config;
      resolveSprite(options?.render?.sprite);

      body = Matter.Bodies.circle(0, 0, radius, options);
      break;
    }
    case 'svg': {
      const { type: _type, src, scale, granularity, position, angle, ...options } = config;
      resolveSprite(options?.render?.sprite);

      if (assets === null) {
        throw new Error(`Trying to use '${src}', but there's no asset map`);
      }
      const svgBuffer = assets.get(src)?.[1] ?? null;
      if (svgBuffer === null) {
        throw new Error(`asset not found: '${src}'`);
      }
      const svgText = new TextDecoder('utf-8').decode(svgBuffer);
      const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml');

      const paths = Array.from(svgDocument.getElementsByTagName('path'));
      const vertexSets = paths.map((path) =>
        Matter.Vertices.scale(Matter.Svg.pathToVertices(path, granularity), scale, scale),
      );

      body = Matter.Bodies.fromVertices(
        position.x,
        position.y,
        vertexSets,
        options,
        true,
      );
      Matter.Body.setAngle(body, angle);
      break;
    }
    case 'robot': {
      throw new Error(`createBody can not handle robots`);
    }
    default: {
      throw new Error(`unknown simulation object: ${config.type}`);
    }
  }

  setInitialPose(body);
  setTemporary(body, temporary);

  return body;
}