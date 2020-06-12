/* eslint-disable no-restricted-globals */
/* eslint no-underscore-dangle: ["error", { "allow": ["__WB_MANIFEST"] }] */

import { skipWaiting, clientsClaim, setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

setCacheNameDetails({
  prefix: 'hedgehog-ide',
  // suffix: 'v1',
});

const WB_MANIFEST = self.__WB_MANIFEST;

skipWaiting();
clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
const precacheManifest = [].concat(
  [{ url: '/app-shell.html' }, { url: '/executor' }],
  WB_MANIFEST ?? [],
);
precacheAndRoute(precacheManifest, {});
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/app-shell.html'), {
    denylist: [],
  }),
);
