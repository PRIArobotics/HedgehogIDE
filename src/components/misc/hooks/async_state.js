// @flow

import * as React from 'react';

type AsyncState<T> = {|
  value: T,
  isLoading: boolean,
  isError: boolean,
|};

type AsyncStateAction<T> =
  | {| type: 'START' |}
  | {| type: 'RESOLVE', value: T |}
  | {| type: 'REJECT' |};

function asyncStateReducer<T>(state: AsyncState<T>, action: AsyncStateAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'START': {
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    }
    case 'RESOLVE': {
      const { value } = action;

      return {
        ...state,
        value,
        isLoading: false,
        isError: false,
      };
    }
    case 'REJECT': {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
    default:
      // eslint-disable-next-line no-throw-literal
      throw 'unreachable';
  }
}

// Implements state that can be set via a promise.
// This hook makes sure that multiple setState calls can not race,
// i.e. only the last promise will go through to the actual state.
// While a setState promise is pending, the previous state will remain.
export function useAsyncState<T>(initialState: T): [T, (T | Promise<T>) => void] {
  const [promise, setPromise] = React.useState<Promise<T> | null>(null);
  const [state, dispatch] = React.useReducer(asyncStateReducer, {
    value: initialState,
    isLoading: false,
    isError: false,
  });

  React.useEffect(() => {
    if (promise === null) return;

    let cancelled = false;

    dispatch({ type: 'START' });
    promise.then(
      value => {
        if (!cancelled) {
          dispatch({ type: 'RESOLVE', value });
        }
      },
      _error => {
        if (!cancelled) {
          dispatch({ type: 'REJECT' });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [promise]);

  function setState(newPromise: T | Promise<T>) {
    if (newPromise && typeof newPromise.then === 'function') {
      // technically we have not checked this is a promise but a thenable.
      // In practice this *should* not matter but who knows.
      // $FlowExpectError
      const realPromise: Promise<T> = newPromise;
      setPromise(realPromise);
    } else {
      // $FlowExpectError
      const value: T = newPromise;

      setPromise(null);
      dispatch({ type: 'RESOLVE', value });

      return undefined;
    }
  }

  // useCallback: React.useState guarantees stability of setState,
  // mirror that here
  return [state.value, React.useCallback(setState, [])];
}

type StoreState<T> = {| value: T |};

// Accesses data in a store and puts it into a state variable.
// A store here is anything that can be read/written using (optionally async)
// load/store functions.
// Whenever the load & store functions change the store value is reloaded,
// and whenever the value is changed using the returned setter, it is stored.
// Until a load is finished (i.e. initially and after changing the store),
// the state is reset to null and any attempts to set it is ignored:
// only a loaded value can be overwritten.
// Possibly pending loads from a previous store are also ignored.
//
// As any change to load/store results in a reload and thus a re-render,
// it would not be possible to pass inline functions to `useStore` without
// wrapping them in `useCallback`.
// For convenience, a `deps` array can be passed in that must be set to the
// dependencies of the passed load/store functions.
// If omitted, this hook uses load & store themselves as the deps.
export function useStore<T>(
  load: () => T | Promise<T>,
  store: T => void | Promise<void>,
  deps?: any[],
): [T | null, (T) => void] {
  const realDeps = deps ?? [load, store];

  const [stateImpl, setStateImpl] = useAsyncState<StoreState<T> | null>(null);

  const state = stateImpl?.value ?? null;

  // reload the state when the store changes
  React.useEffect(() => {
    setStateImpl(Promise.resolve(load()).then(value => ({ value })));

    // after changing the store, clear the state to prevent further use
    return () => {
      setStateImpl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, realDeps);

  // save the state when it changed
  React.useEffect(() => {
    // if the state was not loaded yet for whatever reason, store nothing
    if (stateImpl === null) return;

    store(stateImpl.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...realDeps, stateImpl]);

  function setState(value: T) {
    setStateImpl({ value });
  }

  // useCallback: React.useState guarantees stability of setState,
  // mirror that here
  return [state, React.useCallback(setState, [setStateImpl])];
}
