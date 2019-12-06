export default async function setup() {
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  });
  console.log('The service worker has been registered ', registration);

  navigator.serviceWorker.addEventListener('controllerchange', event => {
    console.log('[controllerchange]', event);

    navigator.serviceWorker.controller.addEventListener('statechange', () => {
      const { state } = navigator.serviceWorker.controller;
      console.log('[statechange]', state);
    });
  });
}
