// @flow

import * as React from 'react';

// similar to useMemo, but without dependencies, and guarantees that the same
// instance is preserved. The initialization is eager, i.e. happens on the
// first hook call.
export function useValue<T>(init: () => T): T {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) ref.current = init();
  return ref.current;
}

// lets one schedule a callback via requestAnimationFrame repeatedly until
// the callback returns `true` or it is cancelled.
//
//    // the callback is repeated until stop is invoked
//    const cb = () => console.log('frame');
//    const [start, stop] = useAnimationFrame(cb);
//
//    // the callback is called only once
//    const cb = () => { console.log('frame'); return true; };
//    const [start] = useAnimationFrame(cb);
//
// Of course, `stop` can be used with self-stopping callbacks as well.
export function useAnimationFrame(
  cb: () => boolean | void,
): [() => void, () => void] {
  const id = React.useRef<AnimationFrameID | null>(null);

  const start = () => {
    id.current = requestAnimationFrame(() => {
      if (cb() !== true) start();
    });
  };

  const stop = () => {
    if (id.current !== null) {
      cancelAnimationFrame(id.current);
      id.current = null;
    }
  };

  return [start, stop];
}
