// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { makeStyles } from '@material-ui/styles';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';

import filer, { fs } from 'filer';

import FlexLayout from 'flexlayout-react';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

import { SettingsIcon, ConsoleIcon, SimulatorIcon } from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import Console from '../Console';
import Editor from '../Editor';
import FileTree, {
  type DirReference,
  type FileReference,
  type FileAction,
  type FileDesc,
  type FileType,
  type ControlledState as FileTreeState,
} from '../FileTree';
import Simulator from '../Simulator';
import VisualEditor, {
  type ControlledState as VisualEditorState,
} from '../VisualEditor';
import SimulatorEditor, {
  type ControlledState as SimulatorEditorState,
} from '../SimulatorEditor';

import {
  type FilerRecursiveStatInfo,
  type FilerRecursiveDirectoryInfo,
  Project,
} from '../../../core/store/projects';

import CreateFileDialog from '../FileTree/CreateFileDialog';
import RenameFileDialog from '../FileTree/RenameFileDialog';
import DeleteFileDialog from '../FileTree/DeleteFileDialog';
import FileUpload from '../FileTree/FileUpload';
import FileDownload from '../FileTree/FileDownload';
import Executor, { type Task } from '../Executor';
import initMiscSdk from '../../../sdk/misc';
import initHedgehogSdk from '../../../sdk/hedgehog';
import PluginManager from '../../../sdk/PluginManager';

const messages = defineMessages({
  simulatorTooltip: {
    id: 'app.ide.toolbar.simulator_tooltip',
    description: 'Tooltip for the Simulator toolbar button',
    defaultMessage: 'Simulator',
  },
  consoleTooltip: {
    id: 'app.ide.toolbar.console_tooltip',
    description: 'Tooltip for the Console toolbar button',
    defaultMessage: 'Console',
  },
  projectSettingsTooltip: {
    id: 'app.ide.toolbar.project_settings_tooltip',
    description: 'Tooltip for the project settings toolbar menu button',
    defaultMessage: 'Project settings',
  },
  showHideMetadata: {
    id: 'app.ide.toolbar.project_settings.show_hide_metadata',
    description: 'Menu item text for showing/hiding the .metadata folder',
    defaultMessage: '{action, select, SHOW {Show} HIDE {Hide}} Metadata',
  },
});

const sh = new fs.Shell();

type OpenOrFocusTabOptions = {|
  location?: FlexLayout.DockLocation,
  alwaysNewTabset?: boolean,
|};

const SquarePaper = React.forwardRef<
  React.ElementConfig<typeof Paper>,
  React.Element<typeof Paper>,
>((props, ref) => <Paper ref={ref} square {...props} />);

const useStylesMaterial = makeStyles(theme => ({
  root: {
    boxSizing: 'border-box',
    height: '100%',
  },
  navToolbar: {
    padding: theme.spacing(1),
    paddingBottom: 0,
  },
  editorContainer: {
    flex: '1 auto',
    position: 'relative',
  },
}));

const defaultLayout = {
  global: {},
  borders: [],
  layout: {
    type: 'tabset',
    children: [],
  },
};

type ExecutionAction =
  | {| action: 'EXECUTE', code: string |}
  | {| action: 'TERMINATE', reset: boolean |}
  | {| action: 'RESET' |};

type ProjectInfo = {|
  project: Project,
  files: FilerRecursiveStatInfo,
  projectUid: string,
|};

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

type Props = {|
  projectName: string,
|};

function Ide({ projectName }: Props) {
  const [projectInfo, setProjectInfo] = React.useState<ProjectInfo | null>(
    null,
  );
  const [pluginsLoaded, setPluginsLoaded] = React.useState<boolean>(false);
  const [runningTask, setRunningTask] = React.useState<Task | null>(null);

  const [state, dispatch] = React.useReducer<StateTypes, IdeAction>(
    ideState,
    initialState,
  );
  const consoleRef = hooks.useElementRef<typeof Console>();
  const simulatorRef = hooks.useElementRef<typeof Simulator>();
  const executorRef = hooks.useElementRef<typeof Executor>();

  const createFileRef = hooks.useElementRef<typeof CreateFileDialog>();
  const renameFileRef = hooks.useElementRef<typeof RenameFileDialog>();
  const deleteFileRef = hooks.useElementRef<typeof DeleteFileDialog>();
  const fileUploadRef = hooks.useElementRef<typeof FileUpload>();
  const fileDownloadRef = hooks.useElementRef<typeof FileDownload>();

  const pluginManagerRef = React.useRef<PluginManager | null>(null);

  async function refreshProject() {
    // load project from the file system
    const project = await Project.getProject(projectName);
    const files = await project.getFiles();
    const projectUid = await project.getUid();

    setProjectInfo({ project, files, projectUid });
  }

  // refresh project when projectName changes
  React.useEffect(() => {
    refreshProject();
  }, [projectName]);

  // reload persistent state & create new plugin manager when the project was refreshed
  React.useEffect(() => {
    (async () => {
      if (projectInfo === null) return;

      const { project, projectUid } = projectInfo;

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

      pluginManagerRef.current = new PluginManager(
        executorRef.current,
        getConsole,
        getSimulator,
      );
      await pluginManagerRef.current.initSdk();
      await pluginManagerRef.current.loadFromProjectMetadata(project);
      setPluginsLoaded(true);
    })();
  }, [projectInfo]);

  function save() {
    if (projectInfo === null) return;
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
      `IDE-State-${projectInfo.projectUid}`,
      JSON.stringify({
        fileTreeState,
        showMetadataFolder,
        layoutState,
        editorStates,
      }),
    );
  }

  // save when any of the persistent state changes
  // TODO make sure the projectUid and the persistent state are not out of sync somewhere
  React.useEffect(() => {
    save();
  }, [
    projectInfo,
    state.fileTreeState,
    state.showMetadataFolder,
    state.layoutState,
    state.editorStates,
  ]);

  function getFile(path: string): FileReference {
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    const [_root, ...fragments] = path.split('/');

    // The reducer function navigates to the child in a directory.
    // Therefore the parameter must be a directory - if it isn't, there can't be a child.
    // The end result, however, can be a regular file.
    const reducer = (file: FilerRecursiveStatInfo, name: string) => {
      if (!file.isDirectory())
        throw new Error(`'${file.name}' is not a directory`);
      // $FlowExpectError
      const directory: FilerRecursiveDirectoryInfo = file;

      // Find the child and make sure it exists
      const child = directory.contents.find(f => f.name === name);
      if (child === undefined) throw new Error(`'${name}' does not exist`);
      return child;
    };

    const file = fragments.reduce(reducer, projectInfo.files);
    return { path, file };
  }

  function getNodes() {
    // eslint-disable-next-line no-throw-literal
    if (state.layoutState === null) throw 'layoutState is null';

    const nodes = {};

    state.layoutState.visitNodes(node => {
      nodes[node.getId()] = node;
    });

    return nodes;
  }

  function openOrFocusTab(nodeJson, options?: OpenOrFocusTabOptions) {
    // eslint-disable-next-line no-throw-literal
    if (state.layoutState === null) throw 'layoutState is null';

    const { id } = nodeJson;
    const { layoutState } = state;

    const nodes = getNodes();
    if (id in nodes) {
      // eslint-disable-next-line no-throw-literal
      if (nodes[id].getType() !== 'tab') throw `'${id}' is not a tab`;

      // the tab exists, select it
      dispatch({
        type: 'LAYOUT',
        layoutAction: FlexLayout.Actions.selectTab(id),
      });
    } else {
      // create the tab.
      const { location, alwaysNewTabset } = {
        location: FlexLayout.DockLocation.RIGHT,
        alwaysNewTabset: false,
        ...(options || {}),
      };

      let targetTabset;
      if (alwaysNewTabset) {
        targetTabset = null;
      } else {
        // what's the active tabset?
        const active = layoutState.getActiveTabset();

        // the active tabset may be undefined or a tabset that was already removed, handle that
        if (
          active !== undefined &&
          active.getId() in nodes &&
          nodes[active.getId()].getType() === 'tabset'
        ) {
          targetTabset = active;
        } else {
          targetTabset = null;
        }
      }

      if (targetTabset !== null) {
        // there's a target tabset; put the new tab there
        dispatch({
          type: 'LAYOUT',
          layoutAction: FlexLayout.Actions.addNode(
            nodeJson,
            targetTabset.getId(),
            FlexLayout.DockLocation.CENTER,
            -1,
          ),
        });
      } else {
        // put the new tab into the root tabset, at the preferred location.
        dispatch({
          type: 'LAYOUT',
          layoutAction: FlexLayout.Actions.addNode(
            nodeJson,
            layoutState.getRoot().getId(),
            location,
            -1,
          ),
        });
      }
    }
  }

  function closeTabsForFile(file: FileReference) {
    // list all file paths below the given file/directory
    const pathsToClose = [];
    function listPaths(current: FileReference) {
      if (current.file.isDirectory()) {
        // $FlowExpectError
        const dir: DirReference = current;
        dir.file.contents.forEach(child =>
          listPaths({ path: `${dir.path}/${child.name}`, file: child }),
        );
      } else {
        pathsToClose.push(current.path);
      }
    }
    listPaths(file);

    // close those paths that are open
    const nodes = getNodes();
    pathsToClose.forEach(path => {
      if (path in nodes) {
        dispatch({
          type: 'LAYOUT',
          layoutAction: FlexLayout.Actions.deleteTab(path),
        });
      }
    });
  }

  async function waitForSimulator(): Promise<
    React.ElementRef<typeof Simulator>,
  > {
    return /* await */ new Promise(resolve => {
      function tryIt() {
        if (simulatorRef.current) {
          resolve(simulatorRef.current);
        } else {
          setTimeout(tryIt, 0);
        }
      }
      tryIt();
    });
  }

  function addSimulator() {
    openOrFocusTab({
      id: 'sim',
      type: 'tab',
      component: 'simulator',
      name: 'Simulator',
    });
    waitForSimulator().then(s => {
      pluginManagerRef.current.simulatorAdded(s);
    });
  }

  async function getSimulator(): Promise<React.ElementRef<typeof Simulator>> {
    addSimulator();
    return /* await */ waitForSimulator();
  }

  function addConsole() {
    openOrFocusTab(
      {
        id: 'console',
        type: 'tab',
        component: 'console',
        name: 'Console',
      },
      {
        location: FlexLayout.DockLocation.BOTTOM,
        alwaysNewTabset: true,
      },
    );
  }

  async function getConsole(): Promise<React.ElementRef<typeof Console>> {
    addConsole();
    return /* await */ new Promise(resolve => {
      function tryIt() {
        if (consoleRef.current) {
          resolve(consoleRef.current);
        } else {
          setTimeout(tryIt, 0);
        }
      }
      tryIt();
    });
  }

  async function handleExecute(code: string) {
    // eslint-disable-next-line no-throw-literal
    if (executorRef.current === null) throw 'ref is null';
    const executorRefCurrent = executorRef.current;

    const sdk = {
      misc: await initMiscSdk(
        getConsole,
        error => {
          setRunningTask(null);
          pluginManagerRef.current
            .getSdk()
            .misc.emit(executorRefCurrent, 'programTerminate', { error });
        },
        pluginManagerRef.current,
        executorRefCurrent,
      ),
      hedgehog: await initHedgehogSdk(getSimulator),
    };

    const task = {
      code,
      api: {
        ...sdk.misc.handlers,
        ...sdk.hedgehog.handlers,
      },
    };
    setRunningTask(executorRefCurrent.addTask(task));

    pluginManagerRef.current
      .getSdk()
      .misc.emit(executorRefCurrent, 'programExecute', null);
  }

  async function handleTerminate() {
    // eslint-disable-next-line no-throw-literal
    if (executorRef.current === null) throw 'ref is null';

    if (runningTask !== null) {
      executorRef.current.removeTask(runningTask);
      setRunningTask(null);
    }
    if (simulatorRef.current !== null) {
      simulatorRef.current.simulation.robots.forEach(robot => {
        robot.setSpeed(0, 0);
      });
    }
  }

  function handleReset() {
    // eslint-disable-next-line no-throw-literal
    if (simulatorRef.current === null) throw 'ref is null';

    simulatorRef.current.simulation.reset();
    pluginManagerRef.current
      .getSdk()
      .misc.emit(executorRef.current, 'simulationReset', null);
  }

  async function handleExecutionAction(action: ExecutionAction) {
    switch (action.action) {
      case 'EXECUTE': {
        const { code } = action;
        await handleExecute(code);
        break;
      }
      case 'TERMINATE': {
        const { reset } = action;
        await handleTerminate();
        if (reset && simulatorRef.current !== null) {
          // TODO this is a workaround for the simulated robot
          // (and probably other objects) still moving after terminating
          await new Promise(resolve => setTimeout(resolve, 100));
          await handleReset();
        }
        break;
      }
      case 'RESET': {
        if (simulatorRef.current !== null) await handleReset();
        break;
      }
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  function beginCreateFile(parentDir: DirReference, desc: FileDesc) {
    // eslint-disable-next-line no-throw-literal
    if (createFileRef.current === null) throw 'ref is null';

    createFileRef.current.show(parentDir, desc);
  }

  async function confirmCreateFile(
    parentDir: DirReference,
    name: string,
    type: FileType,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    try {
      const path = projectInfo.project.resolve(parentDir.path, name);

      if (type === 'FILE') {
        try {
          await fs.promises.stat(path);
        } catch (ex) {
          if (!(ex instanceof filer.Errors.ENOENT)) {
            throw ex;
          }

          await fs.promises.writeFile(path, '');
        }
      } else {
        await fs.promises.mkdir(path);
      }

      await refreshProject();
      // TODO after this has finished, the project's files have not yet been refreshed
      // and opening the new file will fail!

      // reveal the new file
      dispatch({ type: 'EXPAND_DIRECTORY', path: parentDir.path });

      // TODO select the file in the file tree

      // // open the new file
      // const file = getFile(`${parentDir.path}/${name}`);
      // if (file.file.isFile()) handleFileAction({ action: 'OPEN', file });

      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await refreshProject();
        return false;
      }
      console.error(ex);
      throw ex;
    }
  }

  function beginRenameFile(file: FileReference) {
    // split off the './' at the start and the file name at the end
    const path = file.path.split('/').slice(1, -1);

    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    const root = projectInfo.files;

    // the project root is always a directory. assert and cast
    // eslint-disable-next-line no-throw-literal
    if (!root.isDirectory()) throw 'unreachable';
    // $FlowExpectError
    let dir: FilerRecursiveDirectoryInfo = root;

    // determine the files that are siblings of the event target
    path.forEach(fragment => {
      // right now `fragment` is a child of `dir`. look it up.
      const child = dir.contents.find(c => c.name === fragment);

      // the child is an ancestor of `file` and thus a directory. assert and cast
      // eslint-disable-next-line no-throw-literal
      if (child === undefined || !child.isDirectory()) throw 'unreachable';
      // $FlowExpectError
      dir = child;
    });

    // eslint-disable-next-line no-throw-literal
    if (renameFileRef.current === null) throw 'ref is null';
    renameFileRef.current.show(file, dir.contents.map(f => f.name));
  }

  async function confirmRenameFile(
    file: FileReference,
    newName: string,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    try {
      const path = projectInfo.project.resolve(file.path);
      const newPath = projectInfo.project.resolve(file.path, '..', newName);

      closeTabsForFile(file);
      await fs.promises.rename(path, newPath);

      await refreshProject();
      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await refreshProject();
        return false;
      }
      if (ex instanceof filer.Errors.ENOENT) {
        await refreshProject();
        // close the dialog, the file is gone
        return true;
      }
      console.error(ex);
      throw ex;
    }
  }

  function beginDeleteFile(file: FileReference) {
    // eslint-disable-next-line no-throw-literal
    if (deleteFileRef.current === null) throw 'ref is null';

    deleteFileRef.current.show(file);
  }

  async function confirmDeleteFile(file: FileReference): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    try {
      const path = projectInfo.project.resolve(file.path);

      closeTabsForFile(file);
      await sh.promises.rm(path, { recursive: true });

      await refreshProject();
      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await refreshProject();
        return false;
      }
      if (ex instanceof filer.Errors.ENOENT) {
        await refreshProject();
        // close the dialog, the file is gone
        return true;
      }
      console.error(ex);
      throw ex;
    }
  }

  async function moveFile(
    file: FileReference,
    destDirPath: string,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    try {
      const path = projectInfo.project.resolve(file.path);
      const newPath = projectInfo.project.resolve(destDirPath, file.file.name);

      closeTabsForFile(file);
      await fs.promises.rename(path, newPath);

      await refreshProject();
      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await refreshProject();
        return false;
      }
      if (ex instanceof filer.Errors.ENOENT) {
        await refreshProject();
        // close the dialog, the file is gone
        return true;
      }
      console.error(ex);
      throw ex;
    }
  }

  async function downloadFile(file: FileReference): Promise<void> {
    // eslint-disable-next-line no-throw-literal
    if (fileDownloadRef.current === null) throw 'ref is null';
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    const fileDownload = fileDownloadRef.current;

    const path = projectInfo.project.resolve(file.path);
    const content = await fs.promises.readFile(path, 'utf8');

    fileDownload.show(file.file.name, content);
  }

  async function uploadFiles(parentDir: DirReference): Promise<void> {
    // eslint-disable-next-line no-throw-literal
    if (fileUploadRef.current === null) throw 'ref is null';

    const files = await fileUploadRef.current.show();
    if (files.length === 0) return;

    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    // TODO assumes there's exactly one file
    const file = files[0];

    try {
      const path = projectInfo.project.resolve(parentDir.path, file.name);

      // wrap into the augmented Node-style filer.Buffer object
      const buffer = filer.Buffer.from(await file.arrayBuffer());
      // TODO this overwrites files without warning
      await fs.promises.writeFile(path, buffer);

      await refreshProject();
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await refreshProject();
        return;
      }
      console.error(ex);
      throw ex;
    }
  }

  function handleFileAction(action: FileAction) {
    switch (action.action) {
      case 'CREATE': {
        const { parentDir, desc } = action;
        if (desc.type === 'METADATA') {
          confirmCreateFile(parentDir, desc.name, 'FILE');
        } else {
          beginCreateFile(parentDir, desc);
        }
        break;
      }
      case 'RENAME': {
        const { file } = action;
        beginRenameFile(file);
        break;
      }
      case 'DELETE': {
        const { file } = action;
        beginDeleteFile(file);
        break;
      }
      case 'MOVE': {
        const { file, destDirPath } = action;
        moveFile(file, destDirPath);
        break;
      }
      case 'OPEN': {
        const {
          file: { path, file },
        } = action;

        const component = (() => {
          if (path === './.metadata/simulator') return 'simulator-editor';
          // if (path === './.metadata/toolbox') return 'toolbox-editor';
          if (file.name.endsWith('.blockly')) return 'blockly';
          if (file.name.endsWith('.js')) return 'editor';
          return 'editor';
        })();

        openOrFocusTab({
          id: path,
          type: 'tab',
          component,
          name: file.name,
        });
        break;
      }
      case 'DOWNLOAD': {
        const { file } = action;
        downloadFile(file);
        break;
      }
      case 'UPLOAD': {
        const { parentDir } = action;
        uploadFiles(parentDir);
        break;
      }
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  function factory(node: any): React.Node {
    // eslint-disable-next-line no-throw-literal
    if (projectInfo === null) throw 'unreachable';

    const getEditorState = (path: string, editorType: string) => {
      const editorState = state.editorStates[path];
      return editorState ? editorState[editorType] : null;
    };

    const editorStateSetter = (path: string, editorType: string) => state => {
      const editorState = { [editorType]: state };
      dispatch({ type: 'SET_EDITOR_STATE', path, editorState });
    };

    const id = node.getId();
    switch (node.getComponent()) {
      case 'editor': {
        return (
          <Editor
            layoutNode={node}
            project={projectInfo.project}
            path={id}
            onExecutionAction={handleExecutionAction}
            running={runningTask !== null}
          />
        );
      }
      case 'simulator': {
        return (
          <Simulator
            ref={simulatorRef}
            width={600}
            height={400}
            onExecutionAction={handleExecutionAction}
            running={runningTask !== null}
          />
        );
      }
      case 'console': {
        return <Console ref={consoleRef} />;
      }
      case 'blockly': {
        return (
          <VisualEditor
            layoutNode={node}
            project={projectInfo.project}
            path={id}
            {...getEditorState(id, 'blockly')}
            onUpdate={editorStateSetter(id, 'blockly')}
            onExecutionAction={handleExecutionAction}
            running={runningTask !== null}
          />
        );
      }
      case 'simulator-editor': {
        return (
          <SimulatorEditor
            layoutNode={node}
            project={projectInfo.project}
            path={id}
            onSchemaChange={schema => {
              if (simulatorRef.current && schema)
                simulatorRef.current.simulation.jsonInit(schema);
            }}
            {...getEditorState(id, 'simulator-editor')}
            onUpdate={editorStateSetter(id, 'simulator-editor')}
          />
        );
      }
      default:
        return null;
    }
  }

  const projectSettingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'project-controls-menu',
  });

  useStyles(FlexLayoutTheme);
  const classes = useStylesMaterial();

  if (projectInfo === null) return null;

  function filter(path: string, child: FilerRecursiveStatInfo): boolean {
    if (path === '.' && child.name === '.metadata' && !state.showMetadataFolder)
      return false;
    return true;
  }

  const { fileTreeState, layoutState, showMetadataFolder } = state;

  return (
    <Grid className={classes.root} container direction="row" wrap="nowrap">
      <Grid
        item
        component={SquarePaper}
        style={{
          flex: '0 auto',
          minWidth: '150px',
          marginRight: '8px',
          overflow: 'auto',
        }}
      >
        <div className={classes.navToolbar}>
          <Tooltip title={<M {...messages.simulatorTooltip} />}>
            <IconButton
              variant="contained"
              color="primary"
              size="small"
              onClick={addSimulator}
            >
              <SimulatorIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<M {...messages.consoleTooltip} />}>
            <IconButton
              variant="contained"
              color="primary"
              size="small"
              onClick={addConsole}
            >
              <ConsoleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<M {...messages.projectSettingsTooltip} />}>
            <IconButton
              variant="contained"
              color="primary"
              size="small"
              {...bindTrigger(projectSettingsPopupState)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Menu keepMounted {...bindMenu(projectSettingsPopupState)}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                projectSettingsPopupState.close();
                dispatch({ type: 'TOGGLE_METADATA_FOLDER' });
              }}
            >
              <M
                {...messages.showHideMetadata}
                values={{
                  action: showMetadataFolder ? 'HIDE' : 'SHOW',
                }}
              />
            </Button>
          </Menu>
          <hr />
        </div>
        <FileTree
          files={projectInfo.files}
          {...fileTreeState}
          filter={filter}
          onFileAction={handleFileAction}
          onUpdate={
            // eslint-disable-next-line no-shadow
            fileTreeState =>
              dispatch({ type: 'UPDATE_FILE_TREE', fileTreeState })
          }
        />
        <CreateFileDialog ref={createFileRef} onCreate={confirmCreateFile} />
        <RenameFileDialog ref={renameFileRef} onRename={confirmRenameFile} />
        <DeleteFileDialog ref={deleteFileRef} onDelete={confirmDeleteFile} />
        <FileUpload ref={fileUploadRef} />
        <FileDownload ref={fileDownloadRef} />
      </Grid>
      {pluginsLoaded && layoutState !== null ? (
        <Grid item component={SquarePaper} className={classes.editorContainer}>
          <FlexLayout.Layout
            model={layoutState}
            factory={factory}
            classNameMapper={className => FlexLayoutTheme[className]}
            onModelChange={save}
          />
        </Grid>
      ) : null}
      <Executor ref={executorRef} />
    </Grid>
  );
}

export default Ide;
