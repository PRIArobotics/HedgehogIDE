// @flow

import * as React from 'react';

import FlexLayout from 'flexlayout-react';

import { type ControlledState as FileTreeState } from '../FileTree';
import { type ControlledState as VisualEditorState } from '../VisualEditor';
import { type ControlledState as SimulatorEditorState } from '../SimulatorEditor';

type EditorState = {|
  blockly?: VisualEditorState,
  'simulator-editor'?: SimulatorEditorState,
|};

type StateTypes = {|
  fileTreeState: FileTreeState,
  showMetadataFolder: boolean,
  layoutState: FlexLayout.Model | null,
  editorStates: { [key: string]: EditorState },
|};

const defaultLayout = {
  global: {},
  borders: [],
  layout: {
    type: 'tabset',
    children: [],
  },
};

const initialState: StateTypes = {
  fileTreeState: { expandedKeys: [] },
  showMetadataFolder: false,
  layoutState: null,
  editorStates: {},
};

type IdeAction =
  | {| type: 'LOAD', persistentState: $Shape<StateTypes> |}
  | {| type: 'SET_EDITOR_STATE', path: string, editorState: EditorState |}
  | {| type: 'EXPAND_DIRECTORY', path: string |}
  | {| type: 'TOGGLE_METADATA_FOLDER' |}
  | {| type: 'UPDATE_FILE_TREE', fileTreeState: FileTreeState |}
  | {| type: 'LAYOUT', layoutAction: FlexLayout.Action |};

function ideState(state: StateTypes, action: IdeAction): StateTypes {
  switch (action.type) {
    case 'LOAD': {
      const { persistentState } = action;

      return {
        ...state,
        ...persistentState,
      };
    }
    case 'SET_EDITOR_STATE': {
      const { path, editorState } = action;

      return {
        ...state,
        editorStates: {
          ...state.editorStates,
          [path]: {
            ...state.editorStates[path],
            ...editorState,
          },
        },
      };
    }
    case 'EXPAND_DIRECTORY': {
      const { path } = action;
      const { expandedKeys } = state.fileTreeState;

      // no need to update state if the parent directory is already expanded
      if (expandedKeys.includes(path)) return state;

      return {
        ...state,
        fileTreeState: {
          ...state.fileTreeState,
          expandedKeys: [...expandedKeys, path],
        },
      };
    }
    case 'TOGGLE_METADATA_FOLDER': {
      return {
        ...state,
        showMetadataFolder: !state.showMetadataFolder,
      };
    }
    case 'UPDATE_FILE_TREE': {
      const { fileTreeState } = action;
      return {
        ...state,
        fileTreeState,
      };
    }
    case 'LAYOUT': {
      // eslint-disable-next-line no-throw-literal
      if (state.layoutState === null) throw 'layoutState is null';

      const { layoutAction } = action;
      state.layoutState.doAction(layoutAction);
      return state;
    }
    default:
      return state;
  }
}

function save(projectUid: string | null, state: StateTypes) {
  if (projectUid === null) return;
  if (state.layoutState === null) return;

  // eslint-disable-next-line no-shadow
  const {
    fileTreeState,
    showMetadataFolder,
    layoutState: layoutStateModel,
    editorStates,
  } = state;

  const layoutState = layoutStateModel.toJson();

  localStorage.setItem(
    `IDE-State-${projectUid}`,
    JSON.stringify({
      fileTreeState,
      showMetadataFolder,
      layoutState,
      editorStates,
    }),
  );
}
export default function usePersistentState(projectUid: string | null): [
  StateTypes,
  (IdeAction) => void,
  () => void,
] {
  const [state, dispatch] = React.useReducer(ideState, initialState);

  // reload persistent state when the project was refreshed
  React.useEffect(() => {
    (async () => {
      if (projectUid === null) return;

      // load persisted state from localStorage
      const json = localStorage.getItem(`IDE-State-${projectUid}`);

      const persistentState = {
        // default state
        fileTreeState: { expandedKeys: [] },
        showMetadataFolder: false,
        layoutState: defaultLayout,
        editorStates: {},
        // persisted state
        ...(json ? JSON.parse(json) : {}),
      };

      // hydrate FlexLayout model
      const { layoutState: layoutStateJson, ...rest } = persistentState;
      const layoutState = FlexLayout.Model.fromJson(layoutStateJson);

      // set state
      dispatch({ type: 'LOAD', persistentState: { layoutState, ...rest } });
    })();
  }, [projectUid]);

  // save when any of the persistent state changes
  // TODO make sure the projectUid and the persistent state are not out of sync somewhere
  React.useEffect(() => {
    save(projectUid, state);
  }, [projectUid, state]);

  return [state, dispatch, () => save(projectUid, state)];
}
