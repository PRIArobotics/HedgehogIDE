// @flow

import * as React from 'react';

type Setter<T> = ((T => T) | T) => void;
type LocalStorageOptHook<T> = (key: string | null) => [T | void, Setter<T>];
type LocalStorageHook<T> = (key: string) => [T, Setter<T>];

// prettier-ignore
type LocalStorageValue<T> =
  | {| key: null |}
  | {| key: string, value: T |};

export function makeLocalStorageOpt<T>(
  deserialize: (string | null) => T,
  serialize: T => string | null,
): LocalStorageOptHook<T> {
  function load(key: string | null): LocalStorageValue<T> {
    if (key === null) return { key };

    const value = deserialize(localStorage.getItem(key) ?? null);
    return { key, value };
  }

  function store(storageValue: LocalStorageValue<T>) {
    if (storageValue.key === null) return;

    const { key, value } = storageValue;

    const serialized = serialize(value);
    if (serialized !== null) {
      localStorage.setItem(key, serialized);
    } else {
      localStorage.removeItem(key);
    }
  }

  function useLocalStorage(key: string | null) {
    const [state, setStateImpl] = React.useState<LocalStorageValue<T>>(() => load(key));

    // reload state when the key changes
    React.useEffect(() => {
      if (state.key !== key) setStateImpl(load(key));
    }, [key, state.key]);

    // we use a functional update as each update needs to access the key,
    // which is part of the state
    function setState(value: (T => T) | T) {
      // $FlowExpectError
      const setter: T => T = typeof value === 'function' ? value : () => value;

      setStateImpl(oldValue => {
        if (oldValue.key === null) return oldValue;

        const newValue = {
          key: oldValue.key,
          value: setter(oldValue.value),
        };

        store(newValue);
        return newValue;
      });
    }

    const value = state.key !== null ? state.value : undefined;

    // useCallback: React.useState guarantees stability of setState,
    // mirror that here - at least when the key is stable
    return [value, React.useCallback(setState, [setStateImpl])];
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
