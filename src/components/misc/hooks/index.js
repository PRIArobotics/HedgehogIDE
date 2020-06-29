// @flow

import * as React from 'react';

export * from './async_state';
export * from './apollo';
export * from './localStorage';

/**
 * An almost-alias to React.useRef for the typical element ref use case.
 * useRef can also emulate instance variables, this can't.
 * `useElementRef<T>()` is the same as `useRef<React.ElementRef<T> | null>(null)`.
 * The default value of `null` is fixed.
 * example usage:
 *
 *    const aRef = useElementRef<'div'>();
 *    const bRef = useElementRef<typeof Component>();
 *
 *    return (
 *      <>
 *        <div ref={aRef} />
 *        <Component ref={bRef} />
 *      </>
 *    );
 */
export function useElementRef<T: React.ElementType>(): {|
  current: React.ElementRef<T> | null,
|} {
  return React.useRef<React.ElementRef<T> | null>(null);
}

/**
 * Similar to useMemo, but without dependencies, and guarantees that the same
 * instance is preserved. The initialization is eager, i.e. happens on the
 * first hook call.
 */
export function useValue<T>(init: () => T): T {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) ref.current = init();
  return ref.current;
}

/**
 * Lets one schedule a callback via requestAnimationFrame repeatedly until
 * the callback returns `true` or it is cancelled.
 *
 *    // the callback is repeated until stop is invoked
 *    const cb = () => console.log('frame');
 *    const [start, stop] = useAnimationFrame(cb);
 *
 *    // the callback is called only once
 *    const cb = () => { console.log('frame'); return true; };
 *    const [start] = useAnimationFrame(cb);
 *
 * Of course, `stop` can be used with self-stopping callbacks as well.
 */
export function useAnimationFrame(cb: () => boolean | void): [() => void, () => void] {
  const id = React.useRef<AnimationFrameID | null>(null);

  function run() {
    id.current = requestAnimationFrame(() => {
      const done = cb();
      if (done !== true) run();
    });
  }

  function stop() {
    if (id.current !== null) {
      cancelAnimationFrame(id.current);
      id.current = null;
    }
  }

  function start() {
    stop();
    run();
  }

  return [start, stop];
}
