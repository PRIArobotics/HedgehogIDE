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
