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
