// @flow

import * as React from 'react';

import { type ControlledState as FileTreeState } from '../FileTree';
import { type ControlledState as VisualEditorState } from '../VisualEditor';
import { type ControlledState as SimulatorEditorState } from '../SimulatorEditor';

type EditorStates = {|
  blockly?: VisualEditorState,
  'simulator-editor'?: SimulatorEditorState,
|};

type LayoutState = { ... };

type PersistentState = {|
  fileTreeState: FileTreeState,
  showMetadataFolder: boolean,
  layoutState: LayoutState,
  editorStates: { [path: string]: EditorStates },
|};

type IdeAction =
  | {| type: 'LOAD', persistentState: PersistentState |}
  | {| type: 'SET_EDITOR_STATE', path: string, editorStates: EditorStates |}
  | {| type: 'EXPAND_DIRECTORY', path: string |}
  | {| type: 'TOGGLE_METADATA_FOLDER' |}
  | {| type: 'UPDATE_FILE_TREE', fileTreeState: FileTreeState |}
  | {| type: 'LAYOUT', layoutState: LayoutState |};

function ideState(
  state: PersistentState | null,
  action: IdeAction,
): PersistentState {
  // handle LOAD separately to be able to ensure a non-null state below
  if (action.type === 'LOAD') return action.persistentState;
  // eslint-disable-next-line no-throw-literal
  if (state === null) throw 'state must be loaded first';

  switch (action.type) {
    case 'SET_EDITOR_STATE': {
      const { path, editorStates } = action;

      return {
        ...state,
        editorStates: {
          ...state.editorStates,
          [path]: {
            ...state.editorStates[path],
            ...editorStates,
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
      const { layoutState } = action;

      return {
        ...state,
        layoutState,
      };
    }
    default:
      return state;
  }
}

export default function usePersistentState(
  projectUid: string | null,
): [PersistentState | null, (IdeAction) => void] {
  const [state, dispatch] = React.useReducer(ideState, null);

  // reload persistent state when the project was refreshed
  React.useEffect(() => {
    if (projectUid === null) return;

    // load persisted state from localStorage
    const json = localStorage.getItem(`IDE-State-${projectUid}`);

    const persistentState = {
      // default state
      fileTreeState: { expandedKeys: [] },
      showMetadataFolder: false,
      layoutState: {
        global: {},
        borders: [],
        layout: {
          type: 'tabset',
          children: [],
        },
      },
      editorStates: {},
      // persisted state
      ...(json ? JSON.parse(json) : {}),
    };

    // set state
    dispatch({ type: 'LOAD', persistentState });
  }, [projectUid]);

  // save when any of the persistent state changes
  // TODO make sure the projectUid and the persistent state are not out of sync somewhere
  React.useEffect(() => {
    if (projectUid === null) return;
    if (state === null) return;

    localStorage.setItem(`IDE-State-${projectUid}`, JSON.stringify(state));
  }, [projectUid, state]);

  return [state, dispatch];
}
