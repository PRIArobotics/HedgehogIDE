// @flow

import { makeLocalStorageOpt } from '../../misc/hooks';

import { type LayoutState } from './useLayoutModel';
import { type ControlledState as FileTreeState } from '../FileTree';
import { type ControlledState as VisualEditorState } from '../VisualEditor';
import { type ControlledState as SimulatorEditorState } from '../SimulatorEditor';

type EditorStates = {|
  blockly?: VisualEditorState,
  'simulator-editor'?: SimulatorEditorState,
|};

type PersistentState = {|
  fileTreeState: FileTreeState,
  showMetadataFolder: boolean,
  layoutState: LayoutState,
  editorStates: { [path: string]: EditorStates },
|};

type IdeAction =
  | {| type: 'SET_EDITOR_STATE', path: string, editorStates: EditorStates |}
  | {| type: 'EXPAND_DIRECTORY', path: string |}
  | {| type: 'TOGGLE_METADATA_FOLDER' |}
  | {| type: 'UPDATE_FILE_TREE', fileTreeState: FileTreeState |}
  | {| type: 'LAYOUT', layoutState: LayoutState |};

function ideState(state: PersistentState, action: IdeAction): PersistentState {
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

const useStorage = makeLocalStorageOpt<PersistentState>(
  json => ({
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
    ...(json !== null ? JSON.parse(json) : null),
  }),
  state => JSON.stringify(state),
);

export default function usePersistentState(
  projectUid: string | null,
): [PersistentState | null, (IdeAction) => void] {
  const [state, setState] = useStorage(projectUid && `IDE-State-${projectUid}`);

  function dispatch(action: IdeAction) {
    // eslint-disable-next-line no-throw-literal
    if (state === undefined) throw 'state must be loaded first';

    setState(ideState(state, action));
  }

  return [state ?? null, dispatch];
}
