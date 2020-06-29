// @flow

import * as React from 'react';

type Setter<T> = ((T => T) | T) => void;
type LocalStorageOptHook<T> = (key: string | null) => [T | void, Setter<T>];
type LocalStorageHook<T> = (key: string) => [T, Setter<T>];

// prettier-ignore
type LocalStorageValue<T> =
  | {| key: null |}
  | {| key: string, value: T |};

/**
 * Creates a hook for using a value from local storage. Example usage:
 *
 *    const useLocalStorage = makeLocalStorageOpt(
 *      // deserialization function
 *      json => ({ ...(json !== null ? JSON.parse(json) : null) }),
 *      // serialization function
 *      state => (state !== null ? JSON.stringify(state) : null),
 *    );
 *
 *    function Component({ key }) {
 *      const [value, setValue] = useLocalStorage(key);
 *      // ...
 *    }
 *
 * The key may change at runtime and may not be known at all times;
 * parsing and serialization are fixed though, and are therefore passed to the factory.
 * There is no default serialization/deserialization logic, because that logic is required
 * to handle non-existent localStorage keys:
 *
 * - Deserialization will be passed a string, or null value if the key does not exist.
 *   It will not be called at all if there is no key.
 * - Serialization returns a string, or null to delete the item.
 *   It will not be called at all if there is no key.
 *
 * If there's no key, the hook's value will be undefined.
 * It the key does not exist in localStorage,
 * the hook's value will be  the result of deserializing null;
 * in the example that value would be null.
 *
 * Setting the value is ignored if there is no key.
 */
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

/**
 * Creates a hook for using a value from local storage. Example usage:
 *
 *    const useLocalStorage = makeLocalStorageOpt(
 *      // deserialization function
 *      json => ({ ...(json !== null ? JSON.parse(json) : null) }),
 *      // serialization function
 *      state => (state !== null ? JSON.stringify(state) : null),
 *    );
 *
 *    function Component({ key }) {
 *      const [value, setValue] = useLocalStorage(key);
 *      // ...
 *    }
 *
 * This function is equivalent to makeLocalStorageOpt except for its type:
 * the key may change at runtime but must be non-null at all times;
 * this means the hook's value will not be undefined,
 * unless that is a value the deserialization function could return.
 */
export function makeLocalStorage<T>(
  deserialize: (string | null) => T,
  serialize: T => string | null,
): LocalStorageHook<T> {
  // $FlowExpectError
  return makeLocalStorageOpt<T>(deserialize, serialize);
}
