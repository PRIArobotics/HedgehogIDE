// @flow

import * as React from 'react';

import FlexLayout from 'flexlayout-react';

type LayoutProps = {|
  model: FlexLayout.Model,
  onModelChange: () => void,
|};

// FlexLayout.Model uses a different approach to state:
// It uses a mutable model object which is not suitable for react's regular
// handling of state updates.
// it is also not a plain JS object but an instance of a class that needs
// to be serialized for persistence.
// This hook bridges this API mismatch.
// The passed state is used to create a model the first time it is not null,
// and changes to the model (detected by a callback registered with the Layout)
// update the state.
// Subsequent changes to the state are assumed to be triggered by model changes
// and are therefore ignored.
//
//    const [state, setState] = React.useState(null);
//    const [model, layoutProps] = useLayoutModel(state, setState);
//    // somewhere, state is set to a non-null value
//
//    // layoutProps contains both model and onModelChange
//    return model && <FlexLayout.Layout {...layoutProps} />;
export default function useLayoutModel(
  layoutState: { ... } | null,
  setLayoutState: ({ ... }) => void,
): [FlexLayout.Model | null, LayoutProps] {
  const [model, setModel] = React.useState<FlexLayout.Model | null>(null);

  React.useEffect(() => {
    // only load the model once when the layoutState becomes non-null
    if (layoutState === null || model !== null) return;

    setModel(FlexLayout.Model.fromJson(layoutState));
  }, [layoutState, model]);

  return [
    model,
    {
      model,
      onModelChange() {
        // eslint-disable-next-line no-throw-literal
        if (model === null) throw 'onModelChange when model is null';

        setLayoutState(model.toJson());
      },
    },
  ];
}
