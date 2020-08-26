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

import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

import filer, { fs } from 'filer';

import FlexLayout from 'flexlayout-react';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

import { RestoreLayoutIcon, SettingsIcon, ConsoleIcon, SimulatorIcon } from '../../misc/palette';
import * as hooks from '../../misc/hooks';
import SimpleDialog from '../../misc/SimpleDialog';

import Console, { type ConsoleType } from '../Console';
import Editor from '../Editor';
import FileTree, {
  type DirReference,
  type FileReference,
  type FileAction,
  type FileType,
} from '../FileTree';
import Simulator, { type SimulatorType } from '../Simulator';
import VisualEditor from '../VisualEditor';
import SimulatorEditor, { generateSchemaFromXml } from '../SimulatorEditor';
import * as SimulationSchema from '../SimulatorEditor/SimulationSchema';

import {
  type FilerRecursiveStatInfo,
  type FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';

import useCreateFileDialog from '../FileTree/useCreateFileDialog';
import useRenameFileDialog from '../FileTree/useRenameFileDialog';
import useDeleteFileDialog from '../FileTree/useDeleteFileDialog';
import FileUpload from '../FileTree/FileUpload';
import useFileDownload from '../FileTree/useFileDownload';
import Executor, { type Task } from '../Executor';
import initMiscSdk from '../../../sdk/misc';
import initHedgehogSdk from '../../../sdk/hedgehog';
import PluginManager from '../../../sdk/PluginManager';

import useProjectInfo from './useProjectInfo';
import useProjectCache from './useProjectCache';
import usePersistentState from './usePersistentState';
import useLayoutModel, { DEFAULT_LAYOUT_STATE } from './useLayoutModel';

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
  restoreLayoutTooltip: {
    id: 'app.ide.toolbar.restore_layout_tooltip',
    description: 'Tooltip for the Restore Layout toolbar button',
    defaultMessage: 'Restore layout',
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
  createMetadata: {
    id: 'app.ide.toolbar.project_settings.create_metadata',
    description: 'Menu item text for creating the .metadata folder',
    defaultMessage: 'Create Metadata folder',
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

export type ExecutionAction =
  | {| action: 'EXECUTE', code: string |}
  | {| action: 'TERMINATE', reset: boolean |}
  | {| action: 'RESET' |};

type Props = {|
  projectName: string,
|};

/**
 * The main view of the Hedgehog IDE.
 *
 * This component combines managing of transient (what programs are running etc.)
 * and persisted (what files are open etc.) state
 * with UI for all the usual parts of an IDE: a file tree, a surface for file tabs,
 * and in this case a console along with a simulation environment.
 */
function Ide({ projectName }: Props) {
  const project = useProjectInfo(projectName);
  const [pluginsLoaded, setPluginsLoaded] = React.useState<boolean>(false);
  const [runningTask, setRunningTask] = React.useState<Task | null>(null);

  const [projectCache, refreshProject] = useProjectCache(project);
  const [state, dispatch] = usePersistentState(project?.uid ?? null);
  const consoleRef = hooks.useElementRef<typeof Console>();
  const simulatorRef = hooks.useElementRef<typeof Simulator>();
  const executorRef = hooks.useElementRef<typeof Executor>();

  const fileUploadRef = hooks.useElementRef<typeof FileUpload>();

  const pluginManagerRef = React.useRef<PluginManager | null>(null);

  let initialLayoutState = state?.layoutState ?? null;
  if (initialLayoutState === DEFAULT_LAYOUT_STATE) {
    if (projectCache === null) {
      // delay creation of the layout model until the cache is ready
      initialLayoutState = null;
    } else if (projectCache.layoutJson !== null) {
      // use the stored layout instead of the default layout
      initialLayoutState = JSON.parse(projectCache.layoutJson);
    }
    // fallthrough: no stored layout, just use the default layout
  }
  const [layoutModel, setLayoutState, layoutProps] = useLayoutModel(
    initialLayoutState,
    layoutState => {
      dispatch({ type: 'LAYOUT', layoutState });
    },
  );

  // create new plugin manager when ready, but only once
  async function initializePluginManager() {
    if (project === null || layoutModel === null || executorRef.current === null || pluginsLoaded)
      return;

    const pluginManager = new PluginManager(executorRef.current, getConsole, getSimulator);
    await pluginManager.initSdk();
    await pluginManager.loadFromProjectMetadata(project);
    pluginManagerRef.current = pluginManager;
    setPluginsLoaded(true);
  }

  React.useEffect(() => {
    initializePluginManager();
  }, [project, layoutModel, pluginsLoaded]);

  // uses useCallback because otherwise each render resets the ref.
  // (the ref could be registered with a new callback,
  // so the callback needs to be stable)
  const attachExecutor = React.useCallback(
    executor => {
      executorRef.current = executor;
      initializePluginManager();
    },
    [executorRef, project, layoutModel, pluginsLoaded],
  );

  // load the project's simulator schema if it or the simulator changes
  const simulatorXml = projectCache?.simulatorXml ?? null;

  function refreshSimulatorFromSchema(schema: SimulationSchema.SimulatorJson | null) {
    if (simulatorRef.current === null || schema === null) return;

    simulatorRef.current.simulation.jsonInit(schema);
  }

  function refreshSimulator() {
    if (simulatorXml === null) return;

    const schema = generateSchemaFromXml(simulatorXml);
    refreshSimulatorFromSchema(schema);
  }

  React.useEffect(() => {
    refreshSimulator();
  }, [simulatorXml]);

  // uses useCallback because otherwise each render resets the ref.
  // (the ref could be registered with a new callback,
  // so the callback needs to be stable)
  const attachSimulator = React.useCallback(
    sim => {
      simulatorRef.current = sim;
      refreshSimulator();
    },
    [simulatorRef, simulatorXml],
  );

  function getFile(path: string): FileReference {
    // eslint-disable-next-line no-throw-literal
    if (projectCache === null) throw 'unreachable';

    // the root path is the one path where a trailing slash is correct.
    // however, this confuses our use of `split`, so handle it as a special case
    if (path === './') return { path, file: projectCache.files };

    const [_root, ...fragments] = path.split('/');

    // The reducer function navigates to the child in a directory.
    // Therefore the parameter must be a directory - if it isn't, there can't be a child.
    // The end result, however, can be a regular file.
    const reducer = (file: FilerRecursiveStatInfo, name: string) => {
      if (!file.isDirectory()) throw new Error(`'${file.name}' is not a directory`);
      // $FlowExpectError
      const directory: FilerRecursiveDirectoryInfo = file;

      // Find the child and make sure it exists
      const child = directory.contents.find(f => f.name === name);
      if (child === undefined) throw new Error(`'${name}' does not exist`);
      return child;
    };

    const file = fragments.reduce(reducer, projectCache.files);
    return { path, file };
  }

  function getNodes() {
    // eslint-disable-next-line no-throw-literal
    if (layoutModel === null) throw 'layoutModel is null';

    const nodes = {};

    layoutModel.visitNodes(node => {
      nodes[node.getId()] = node;
    });

    return nodes;
  }

  function openOrFocusTab(nodeJson, options?: OpenOrFocusTabOptions) {
    // eslint-disable-next-line no-throw-literal
    if (layoutModel === null) throw 'layoutModel is null';

    const { id } = nodeJson;

    const nodes = getNodes();
    if (id in nodes) {
      // eslint-disable-next-line no-throw-literal
      if (nodes[id].getType() !== 'tab') throw `'${id}' is not a tab`;

      // the tab exists, select it
      layoutModel.doAction(FlexLayout.Actions.selectTab(id));
    } else {
      // create the tab.
      const { location, alwaysNewTabset } = {
        location: FlexLayout.DockLocation.RIGHT,
        alwaysNewTabset: false,
        ...(options ?? {}),
      };

      let targetTabset;
      if (alwaysNewTabset) {
        targetTabset = null;
      } else {
        // what's the active tabset?
        const active = layoutModel.getActiveTabset();

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
        layoutModel.doAction(
          FlexLayout.Actions.addNode(
            nodeJson,
            targetTabset.getId(),
            FlexLayout.DockLocation.CENTER,
            -1,
          ),
        );
      } else {
        // put the new tab into the root tabset, at the preferred location.
        layoutModel.doAction(
          FlexLayout.Actions.addNode(nodeJson, layoutModel.getRoot().getId(), location, -1),
        );
      }
    }
  }

  function closeTabsForFile(file: FileReference) {
    // eslint-disable-next-line no-throw-literal
    if (layoutModel === null) throw 'layoutModel is null';

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
        layoutModel.doAction(FlexLayout.Actions.deleteTab(path));
      }
    });
  }

  async function waitForSimulator(): Promise<SimulatorType> {
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
      // eslint-disable-next-line no-throw-literal
      if (pluginManagerRef.current === null) throw 'ref is null';

      pluginManagerRef.current.simulatorAdded(s);
    });
  }

  async function getSimulator(): Promise<SimulatorType> {
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

  async function getConsole(): Promise<ConsoleType> {
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
    const executor = executorRef.current;
    // eslint-disable-next-line no-throw-literal
    if (executor === null) throw 'ref is null';

    const pluginManager = pluginManagerRef.current;
    // eslint-disable-next-line no-throw-literal
    if (pluginManager === null) throw 'ref is null';

    const sdk = {
      misc: await initMiscSdk(
        getConsole,
        error => {
          setRunningTask(null);

          pluginManager.getSdk().misc.emit(executor, 'programTerminate', { error });
        },
        pluginManager,
        executor,
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
    setRunningTask(executor.addTask(task));

    pluginManager.getSdk().misc.emit(executor, 'programExecute', null);
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
        robot.controller.off();
      });
    }
  }

  function handleReset() {
    const simulator = simulatorRef.current;
    // eslint-disable-next-line no-throw-literal
    if (simulator === null) throw 'ref is null';

    const executor = executorRef.current;
    // eslint-disable-next-line no-throw-literal
    if (executor === null) throw 'ref is null';

    const pluginManager = pluginManagerRef.current;
    // eslint-disable-next-line no-throw-literal
    if (pluginManager === null) throw 'ref is null';

    simulator.simulation.reset();
    pluginManager.getSdk().misc.emit(executor, 'simulationReset', null);
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

  // this is a hack to be able to open new files
  const [createdPath, setCreatedPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (createdPath === null) return;

    try {
      const file = getFile(createdPath);
      if (file.file.isFile()) handleFileAction({ action: 'OPEN', file });
      setCreatedPath(null);
    } catch (_ex) {
      // will automatically try again when projectCache has been updated
    }
  }, [projectCache, createdPath]);

  async function confirmCreateFile(
    parentDir: DirReference,
    name: string,
    type: FileType,
    content: string = '',
    overwriteIfExists: boolean = false,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (project === null) throw 'unreachable';

    const path = project.resolve(parentDir.path, name);

    // check existence of the file/try creating the directory
    let isNew;
    if (type === 'FILE') {
      try {
        await fs.promises.stat(path);
        isNew = false;
      } catch (ex) {
        if (!(ex instanceof filer.Errors.ENOENT)) {
          console.error(ex);
          throw ex;
        }
        isNew = true;
      }
    } else {
      try {
        await fs.promises.mkdir(path);
        isNew = true;
      } catch (ex) {
        if (!(ex instanceof filer.Errors.EEXIST)) {
          console.error(ex);
          throw ex;
        }
        isNew = false;
      }
    }

    try {
      // directory was already created above, file needs to be created here
      if (type === 'FILE') {
        if (isNew || overwriteIfExists) {
          // create/update the file
          await fs.promises.writeFile(path, content, 'utf8');
        }
      }

      // no matter whether we actually created the file/directory, we want to
      // - refresh the project
      // - reveal the file
      // - TODO select the file in the file tree
      // - open the file

      await refreshProject();

      dispatch({ type: 'EXPAND_DIRECTORY', path: parentDir.path });

      // TODO select the file in the file tree

      setCreatedPath(`${parentDir.path}/${name}`);

      return isNew;
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }

  const createFile = useCreateFileDialog(confirmCreateFile);

  async function confirmRenameFile(file: FileReference, newName: string): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (project === null) throw 'unreachable';

    try {
      const path = project.resolve(file.path);
      const newPath = project.resolve(file.path, '..', newName);

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

  const renameFile = useRenameFileDialog(confirmRenameFile);

  function beginRenameFile(file: FileReference) {
    // split off the './' at the start and the file name at the end
    const path = file.path.split('/').slice(1, -1);

    // eslint-disable-next-line no-throw-literal
    if (projectCache === null) throw 'unreachable';

    const root = projectCache.files;

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

    renameFile.show(file, dir.contents.map(f => f.name));
  }

  async function confirmDeleteFile(file: FileReference): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (project === null) throw 'unreachable';

    try {
      const path = project.resolve(file.path);

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

  const deleteFile = useDeleteFileDialog(confirmDeleteFile);

  async function moveFile(file: FileReference, destDirPath: string): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (project === null) throw 'unreachable';

    try {
      const path = project.resolve(file.path);
      const newPath = project.resolve(destDirPath, file.file.name);

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

  const fileDownload = useFileDownload();

  async function downloadFile(file: FileReference): Promise<void> {
    // eslint-disable-next-line no-throw-literal
    if (project === null) throw 'unreachable';

    const path = project.resolve(file.path);
    const content = await fs.promises.readFile(path, 'utf8');

    fileDownload.show(file.file.name, content);
  }

  async function uploadFiles(parentDir: DirReference): Promise<void> {
    // eslint-disable-next-line no-throw-literal
    if (fileUploadRef.current === null) throw 'ref is null';

    const files = await fileUploadRef.current.show();
    if (files.length === 0) return;

    // eslint-disable-next-line no-throw-literal
    if (project === null) throw 'unreachable';

    // TODO assumes there's exactly one file
    const file = files[0];

    try {
      const path = project.resolve(parentDir.path, file.name);

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
          if (parentDir.path === './.metadata' && desc.name === 'layout') {
            // eslint-disable-next-line no-throw-literal
            if (state === null) throw 'unreachable';

            const layoutJson = JSON.stringify(state.layoutState);
            // TODO this will not show the content in an already open file tab
            confirmCreateFile(parentDir, desc.name, desc.fileType, layoutJson, true);
          } else {
            confirmCreateFile(parentDir, desc.name, desc.fileType);
          }
        } else {
          createFile.show(parentDir, desc);
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
        deleteFile.show(file);
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

  const projectSettingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'project-controls-menu',
  });

  useStyles(FlexLayoutTheme);
  const classes = useStylesMaterial();

  if (project === null || projectCache === null || state === null) return null;

  const { fileTreeState, showMetadataFolder } = state;

  let hasMetadataFolder;
  try {
    getFile('./.metadata');
    hasMetadataFolder = true;
  } catch (_ex) {
    hasMetadataFolder = false;
  }

  function factory(node: any): React.Node {
    function bindEditorProps(path: string, editorType: string) {
      return {
        ...(() => {
          const editorStates = state.editorStates[path];
          const editorState = editorStates ? editorStates[editorType] : null;
          return editorState;
        })(),
        onUpdate: editorState => {
          const editorStates = { [editorType]: editorState };
          dispatch({ type: 'SET_EDITOR_STATE', path, editorStates });
        },
      };
    }

    const id = node.getId();
    switch (node.getComponent()) {
      case 'editor': {
        return (
          <Editor
            layoutNode={node}
            project={project}
            path={id}
            // {...bindEditorProps(id, 'editor')}
            onExecutionAction={handleExecutionAction}
            running={runningTask !== null}
          />
        );
      }
      case 'simulator': {
        return (
          <Simulator
            ref={attachSimulator}
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
            project={project}
            path={id}
            {...bindEditorProps(id, 'blockly')}
            onExecutionAction={handleExecutionAction}
            running={runningTask !== null}
          />
        );
      }
      case 'simulator-editor': {
        return (
          <SimulatorEditor
            layoutNode={node}
            project={project}
            path={id}
            {...bindEditorProps(id, 'simulator-editor')}
            onSchemaChange={refreshSimulatorFromSchema}
          />
        );
      }
      default:
        return null;
    }
  }

  function filter(path: string, child: FilerRecursiveStatInfo): boolean {
    if (path === '.' && child.name === '.metadata' && !showMetadataFolder) return false;
    return true;
  }

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
            <IconButton variant="contained" color="primary" size="small" onClick={addSimulator}>
              <SimulatorIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<M {...messages.consoleTooltip} />}>
            <IconButton variant="contained" color="primary" size="small" onClick={addConsole}>
              <ConsoleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<M {...messages.restoreLayoutTooltip} />}>
            <span>
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                disabled={(projectCache?.layoutJson ?? null) === null}
                onClick={() => {
                  const layoutJson = projectCache?.layoutJson ?? null;
                  // eslint-disable-next-line no-throw-literal
                  if (layoutJson === null) throw 'unreachable';

                  setLayoutState(JSON.parse(layoutJson));
                }}
              >
                <RestoreLayoutIcon />
              </IconButton>
            </span>
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
                if (hasMetadataFolder) {
                  dispatch({ type: 'TOGGLE_METADATA_FOLDER' });
                } else {
                  // $FlowExpectError
                  const parentDir: DirReference = getFile('./');

                  handleFileAction({
                    action: 'CREATE',
                    parentDir,
                    desc: {
                      type: 'METADATA',
                      name: '.metadata',
                      fileType: 'DIRECTORY',
                    },
                  });
                  dispatch({ type: 'SHOW_METADATA_FOLDER', value: true });
                }
              }}
            >
              <M
                {...(hasMetadataFolder ? messages.showHideMetadata : messages.createMetadata)}
                values={
                  hasMetadataFolder
                    ? {
                        action: showMetadataFolder ? 'HIDE' : 'SHOW',
                      }
                    : {}
                }
              />
            </Button>
          </Menu>
          <hr />
        </div>
        <FileTree
          files={projectCache.files}
          {...fileTreeState}
          filter={filter}
          onFileAction={handleFileAction}
          onUpdate={
            // eslint-disable-next-line no-shadow
            fileTreeState => dispatch({ type: 'UPDATE_FILE_TREE', fileTreeState })
          }
        />
        <SimpleDialog id="create-file-dialog" {...createFile.mountSimpleDialog()} />
        <SimpleDialog id="rename-file-dialog" {...renameFile.mountSimpleDialog()} />
        <SimpleDialog id="delete-file-dialog" {...deleteFile.mountSimpleDialog()} />
        <FileUpload ref={fileUploadRef} />
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
        <a {...fileDownload.mountLink()} />
      </Grid>
      {pluginsLoaded && layoutModel !== null ? (
        <Grid item component={SquarePaper} className={classes.editorContainer}>
          <FlexLayout.Layout
            {...layoutProps}
            factory={factory}
            classNameMapper={className => FlexLayoutTheme[className]}
          />
        </Grid>
      ) : null}
      <Executor ref={attachExecutor} />
    </Grid>
  );
}

export default Ide;
