// @flow

import * as React from 'react';

import FlexLayout from 'flexlayout-react';

// FlexLayout.Model uses a different approach to state:
// It uses a mutable model object which is not suitable for react's regular
// handling of state updates.
// it is also not a plain JS object but an instance of a class that needs
// to be serialized for persistence.
// This hook bridges this API mismatch.
// The passed state is used to create a model the first time it is not null,
// and changes to the model (detected by registering the returned callback)
// update the state.
// Subsequent changes to the state are assumed to be triggered by model changes
// and are therefore ignored.
//
//    const [state, setState] = React.useState(null);
//    const [model, handleModelChange] = useLayoutModel(state, setState);
//    // somewhere, state is set to a non-null value
//
//    return (
//      model &&
//      <FlexLayout.Layout
//        model={model}
//        onModelChange={handleModelChange}
//      />
//    );

export default function useLayoutModel(
  layoutState: { ... } | null,
  setLayoutState: ({ ... }) => void,
): [FlexLayout.Model | null, () => void] {
  const modelRef = React.useRef<FlexLayout.Model | null>(null);

  React.useEffect(() => {
    // only load the model once when the layoutState becomes non-null
    if (layoutState === null || modelRef.current !== null) return;

    modelRef.current = FlexLayout.Model.fromJson(layoutState);
  }, [layoutState]);

  function handleModelChange() {
    // eslint-disable-next-line no-throw-literal
    if (modelRef.current === null) throw 'handleModelChange when model is null';

    setLayoutState(modelRef.current.toJson());
  }

  // TODO is it safe to return modelRef.current here? It is not reactive...
  return [modelRef.current, handleModelChange];
}
