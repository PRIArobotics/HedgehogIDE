/* eslint-disable no-restricted-globals */
/* eslint no-underscore-dangle: ["error", { "allow": ["__WB_MANIFEST"] }] */

import { skipWaiting, clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

const WB_MANIFEST = self.__WB_MANIFEST;

skipWaiting();
clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
const precacheManifest = [].concat(
  [{ url: '/' }, { url: '/executor' }],
  WB_MANIFEST || [],
);
precacheAndRoute(precacheManifest, {});
