// @flow

/* eslint-disable no-restricted-globals */
/* eslint no-underscore-dangle: ["error", { "allow": ["__precacheManifest"] }] */

declare var workbox: any;

workbox.core.skipWaiting();
workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [{ url: '/' }, { url: '/executor' }].concat(
  self.__precacheManifest || [],
);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
