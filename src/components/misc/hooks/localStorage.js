// @flow

import * as React from 'react';

type LocalStorageOptHook<T> = (key: string | null) => [T | void, (T) => void];
type LocalStorageHook<T> = (key: string) => [T, (T) => void];

export function makeLocalStorageOpt<T>(
  deserialize: (string | null) => T,
  serialize: T => string | null,
): LocalStorageOptHook<T> {
  function load(key: string | null): T | void {
    if (key === null) return undefined;

    return deserialize(localStorage.getItem(key) ?? null);
  }

  function store(key: string, value: T) {
    const serialized = serialize(value);
    if (serialized !== null) {
      localStorage.setItem(key, serialized);
    } else {
      localStorage.removeItem(key);
    }
  }

  function useLocalStorage(key: string | null) {
    const prevKeyRef = React.useRef<string | null>(key);
    const [state, setStateImpl] = React.useState<T | void>(() => load(key));

    // reload state when the key changes
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      setStateImpl(load(key));
    }

    // store state when the value changes
    function setState(value: T) {
      if (key === null) return;

      store(key, value);
      setStateImpl(value);
    }

    // useCallback: React.useState guarantees stability of setState,
    // mirror that here - at least when the key is stable
    return [state, React.useCallback(setState, [key, setStateImpl])];
  }

  return useLocalStorage;
}

export function makeLocalStorage<T>(
  deserialize: (string | null) => T,
  serialize: T => string | null,
): LocalStorageHook<T> {
  // $FlowExpectError
  return makeLocalStorageOpt<T>(deserialize, serialize);
}
