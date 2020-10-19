// @flow

import Matter from 'matter-js';

import type { Pose } from './misc';

export function resolveSprite(
  sprite: { texture: string | void } | void,
  assets: Map<string, [string, Uint8Array]> | null = null,
) {
  if (sprite?.texture && sprite.texture.startsWith('asset:')) {
    if (assets === null) {
      throw new Error(`Trying to use '${sprite.texture}', but there's no asset map`);
    }
    // the result may be undefined, which is fine with us,
    // because that means Matter.js will not fail loading a texture
    sprite.texture = assets.get(sprite.texture)?.[0];
  }
};

export function setInitialPose(body: Matter.Body, pose: Pose | void) {
  if (!body.plugin.hedgehog) body.plugin.hedgehog = {};
  body.plugin.hedgehog.initialPose = pose ?? { ...body.position, angle: body.angle };
}

export function setTemporary(body: Matter.Body, temporary: boolean) {
  if (!body.plugin.hedgehog) body.plugin.hedgehog = {};
  body.plugin.hedgehog.temporary = temporary;
}
