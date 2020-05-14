// @flow
/* eslint-disable react/no-multi-comp */

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { defineMessages, FormattedMessage as M } from 'react-intl';
import { compose } from 'react-apollo';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import { withStyles as withStylesMaterial } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import filer, { fs } from 'filer';

import FlexLayout from 'flexlayout-react';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

import { SettingsIcon, ConsoleIcon, SimulatorIcon } from '../../misc/palette';

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

const styled = withStylesMaterial(theme => ({
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

type EditorState = {|
  blockly?: VisualEditorState,
  'simulator-editor'?: SimulatorEditorState,
|};

type PropTypes = {|
  classes: Object,
  projectName: string,
|};
type StateTypes = {|
  projectInfo: {|
    project: Project,
    files: FilerRecursiveStatInfo,
    projectUid: string,
  |} | null,
  fileTreeState: FileTreeState,
  showMetadataFolder: boolean,
  layoutState: FlexLayout.Model,
  editorStates: { [key: string]: EditorState },
  runningTask: Task | null,
  pluginsLoaded: boolean,
|};

class Ide extends React.Component<PropTypes, StateTypes> {
  factory = (node: any) => {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';
    const { project } = this.state.projectInfo;

    const getEditorState = (id: string, editorType: string) => {
      const editorState = this.state.editorStates[id];
      return editorState ? editorState[editorType] : null;
    };

    const editorStateSetter = (id: string, editorType: string) => state => {
      this.setState(
        oldState => {
          const oldEditorState = oldState.editorStates[id];
          return {
            editorStates: {
              ...oldState.editorStates,
              [id]: {
                ...oldEditorState,
                [editorType]: {
                  ...(oldEditorState ? oldEditorState[editorType] : null),
                  ...state,
                },
              },
            },
          };
        },
        () => this.save(),
      );
    };

    const id = node.getId();
    switch (node.getComponent()) {
      case 'editor': {
        return (
          <Editor
            layoutNode={node}
            project={project}
            path={id}
            onExecutionAction={action => this.handleExecutionAction(action)}
            running={!!this.state.runningTask}
          />
        );
      }
      case 'simulator': {
        return (
          <Simulator
            ref={this.simulatorRef}
            width={600}
            height={400}
            onExecutionAction={action => this.handleExecutionAction(action)}
            running={!!this.state.runningTask}
          />
        );
      }
      case 'console': {
        return <Console ref={this.consoleRef} />;
      }
      case 'blockly': {
        return (
          <VisualEditor
            layoutNode={node}
            project={project}
            path={id}
            {...getEditorState(id, 'blockly')}
            onUpdate={editorStateSetter(id, 'blockly')}
            onExecutionAction={action => this.handleExecutionAction(action)}
            running={!!this.state.runningTask}
          />
        );
      }
      case 'simulator-editor': {
        return (
          <SimulatorEditor
            layoutNode={node}
            project={project}
            path={id}
            onSchemaChange={schema => {
              if (this.simulatorRef.current && schema)
                this.simulatorRef.current.initSimulationJson(schema);
            }}
            {...getEditorState(id, 'simulator-editor')}
            onUpdate={editorStateSetter(id, 'simulator-editor')}
          />
        );
      }
      default:
        return null;
    }
  };

  consoleRef: RefObject<typeof Console> = React.createRef();
  simulatorRef: RefObject<typeof Simulator> = React.createRef();
  executorRef: RefObject<typeof Executor> = React.createRef();

  createFileRef: RefObject<typeof CreateFileDialog> = React.createRef();
  renameFileRef: RefObject<typeof RenameFileDialog> = React.createRef();
  deleteFileRef: RefObject<typeof DeleteFileDialog> = React.createRef();
  fileUploadRef: RefObject<typeof FileUpload> = React.createRef();
  fileDownloadRef: RefObject<typeof FileDownload> = React.createRef();

  pluginManager: PluginManager | null = null;

  state = {
    projectInfo: null,
    fileTreeState: {},
    showMetadataFolder: false,
    layoutState: FlexLayout.Model.fromJson(defaultLayout),
    editorStates: {},
    runningTask: null,
    pluginsLoaded: false,
  };

  constructor(props: PropTypes) {
    super(props);

    this.refreshProject();
  }

  async refreshProject() {
    const project = await Project.getProject(this.props.projectName);
    const files = await project.getFiles();
    const projectUid = await project.getUid();

    let persistentState = {
      fileTreeState: { expandedKeys: [] },
      showMetadataFolder: false,
      layoutState: defaultLayout,
      editorStates: {},
    };

    const json = localStorage.getItem(`IDE-State-${projectUid}`);
    if (json) {
      persistentState = {
        ...persistentState,
        ...JSON.parse(json),
      };
    }
    const {
      fileTreeState,
      showMetadataFolder,
      layoutState: layoutStateJson,
      editorStates,
    } = persistentState;
    const layoutState = FlexLayout.Model.fromJson(layoutStateJson);

    const projectInfo = { project, files, projectUid };
    this.setState({
      projectInfo,
      fileTreeState,
      showMetadataFolder,
      layoutState,
      editorStates,
    });

    this.pluginManager = new PluginManager(
      this.executorRef.current,
      this.getConsole.bind(this),
      this.getSimulator.bind(this),
    );
    await this.pluginManager.initSdk();
    await this.pluginManager.loadFromProjectMetadata(project);
    this.setState({ pluginsLoaded: true });
  }

  save() {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'projectInfo is null';
    // eslint-disable-next-line no-shadow
    const {
      projectInfo: { projectUid },
      fileTreeState,
      showMetadataFolder,
      layoutState: layoutStateModel,
      editorStates,
    } = this.state;
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

  getFile(path: string): FileReference {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const {
      projectInfo: { files },
    } = this.state;
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

    const file = fragments.reduce(reducer, files);
    return { path, file };
  }

  getNodes() {
    const nodes = {};

    this.state.layoutState.visitNodes(node => {
      nodes[node.getId()] = node;
    });

    return nodes;
  }

  openOrFocusTab(nodeJson, options?: OpenOrFocusTabOptions) {
    const { id } = nodeJson;
    const { layoutState } = this.state;

    const nodes = this.getNodes();
    if (id in nodes) {
      // eslint-disable-next-line no-throw-literal
      if (nodes[id].getType() !== 'tab') throw `'${id}' is not a tab`;

      // the tab exists, select it
      layoutState.doAction(FlexLayout.Actions.selectTab(id));
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
        layoutState.doAction(
          FlexLayout.Actions.addNode(
            nodeJson,
            targetTabset.getId(),
            FlexLayout.DockLocation.CENTER,
            -1,
          ),
        );
      } else {
        // put the new tab into the root tabset, at the preferred location.
        layoutState.doAction(
          FlexLayout.Actions.addNode(
            nodeJson,
            layoutState.getRoot().getId(),
            location,
            -1,
          ),
        );
      }
    }
  }

  addSimulator = () => {
    this.openOrFocusTab({
      id: 'sim',
      type: 'tab',
      component: 'simulator',
      name: 'Simulator',
    });
    this.waitForSimulator().then(s => this.pluginManager.simulatorAdded(s));
  };

  addConsole = () =>
    this.openOrFocusTab(
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

  getConsole = () =>
    new Promise(resolve => {
      const tryIt = () => {
        this.addConsole();
        if (this.consoleRef.current) {
          resolve(this.consoleRef.current);
        } else {
          setTimeout(tryIt, 0);
        }
      };
      tryIt();
    });

  getSimulator = () => {
    this.addSimulator();
    return this.waitForSimulator();
  };

  waitForSimulator = () =>
    new Promise(resolve => {
      const tryIt = () => {
        if (this.simulatorRef.current) {
          resolve(this.simulatorRef.current);
        } else {
          setTimeout(tryIt, 0);
        }
      };
      tryIt();
    });

  async handleExecutionAction(action: ExecutionAction) {
    switch (action.action) {
      case 'EXECUTE': {
        const { code } = action;
        await this.handleExecute(code);
        break;
      }
      case 'TERMINATE': {
        const { reset } = action;
        await this.handleTerminate();
        // TODO this is a workaround for the simulated robot
        // (and probably other objects) still moving after terminating
        await new Promise(resolve => setTimeout(resolve, 100));
        if (reset) await this.handleReset();
        break;
      }
      case 'RESET': {
        await this.handleReset();
        break;
      }
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  async handleExecute(code: string) {
    // eslint-disable-next-line no-throw-literal
    if (this.executorRef.current === null) throw 'ref is null';
    const executorRefCurrent = this.executorRef.current;

    const sdk = {
      misc: await initMiscSdk(
        this.getConsole.bind(this),
        error => {
          this.setState({ runningTask: null });
          this.pluginManager
            .getSdk()
            .misc.emit(this.executorRef.current, 'programTerminate', { error });
        },
        this.pluginManager,
        executorRefCurrent,
      ),
      hedgehog: await initHedgehogSdk(this.getSimulator.bind(this)),
    };

    const task = {
      code,
      api: {
        ...sdk.misc.handlers,
        ...sdk.hedgehog.handlers,
      },
    };
    this.setState({
      runningTask: executorRefCurrent.addTask(task),
    });

    this.pluginManager
      .getSdk()
      .misc.emit(this.executorRef.current, 'programExecute', null);
  }

  async handleTerminate() {
    // eslint-disable-next-line no-throw-literal
    if (this.executorRef.current === null) throw 'ref is null';

    this.executorRef.current.removeTask(this.state.runningTask);
    this.setState({ runningTask: null });
    (await this.getSimulator()).robots.forEach(robot => {
      robot.setSpeed(0, 0);
    });
  }

  handleReset() {
    // eslint-disable-next-line no-throw-literal
    if (this.simulatorRef.current === null) throw 'ref is null';

    this.simulatorRef.current.reset();
    this.pluginManager
      .getSdk()
      .misc.emit(this.executorRef.current, 'simulationReset', null);
  }

  handleFileAction(action: FileAction) {
    switch (action.action) {
      case 'CREATE': {
        const { parentDir, desc } = action;
        if (desc.type === 'METADATA') {
          this.confirmCreateFile(parentDir, desc.name, 'FILE');
        } else {
          this.beginCreateFile(parentDir, desc);
        }
        break;
      }
      case 'RENAME': {
        const { file } = action;
        this.beginRenameFile(file);
        break;
      }
      case 'DELETE': {
        const { file } = action;
        this.beginDeleteFile(file);
        break;
      }
      case 'MOVE': {
        const { file, destDirPath } = action;
        this.moveFile(file, destDirPath);
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

        this.openOrFocusTab({
          id: path,
          type: 'tab',
          component,
          name: file.name,
        });
        break;
      }
      case 'DOWNLOAD': {
        const { file } = action;
        this.downloadFile(file);
        break;
      }
      case 'UPLOAD': {
        const { parentDir } = action;
        this.uploadFiles(parentDir);
        break;
      }
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  beginCreateFile(parentDir: DirReference, desc: FileDesc) {
    // eslint-disable-next-line no-throw-literal
    if (this.createFileRef.current === null) throw 'ref is null';

    this.createFileRef.current.show(parentDir, desc);
  }

  async confirmCreateFile(
    parentDir: DirReference,
    name: string,
    type: FileType,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const {
      projectInfo: { project },
    } = this.state;

    try {
      const path = project.resolve(parentDir.path, name);

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

      await this.refreshProject();

      // reveal the new file
      this.setState(
        oldState => {
          const { fileTreeState: oldFileTreeState } = oldState;
          const { expandedKeys: oldExpandedKeys } = oldFileTreeState;

          // no need to update state if the parent directory is already expanded
          if (oldExpandedKeys.includes(parentDir.path)) return {};

          // add the parent directory to the expanded keys
          return {
            fileTreeState: {
              ...oldFileTreeState,
              expandedKeys: [...oldExpandedKeys, parentDir.path],
            },
          };
        },
        () => this.save(),
      );

      // TODO select the file in the file tree

      // open the new file
      const file = this.getFile(`${parentDir.path}/${name}`);
      if (file.file.isFile()) this.handleFileAction({ action: 'OPEN', file });

      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await this.refreshProject();
        return false;
      }
      console.error(ex);
      throw ex;
    }
  }

  beginRenameFile(file: FileReference) {
    // split off the './' at the start and the file name at the end
    const path = file.path.split('/').slice(1, -1);

    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const root = this.state.projectInfo.files;

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
    if (this.renameFileRef.current === null) throw 'ref is null';
    this.renameFileRef.current.show(file, dir.contents.map(f => f.name));
  }

  async confirmRenameFile(
    file: FileReference,
    newName: string,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const {
      projectInfo: { project },
    } = this.state;

    try {
      const path = project.resolve(file.path);
      const newPath = project.resolve(file.path, '..', newName);

      this.closeTabsForFile(file);
      await fs.promises.rename(path, newPath);

      await this.refreshProject();
      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await this.refreshProject();
        return false;
      }
      if (ex instanceof filer.Errors.ENOENT) {
        await this.refreshProject();
        // close the dialog, the file is gone
        return true;
      }
      console.error(ex);
      throw ex;
    }
  }

  beginDeleteFile(file: FileReference) {
    // eslint-disable-next-line no-throw-literal
    if (this.deleteFileRef.current === null) throw 'ref is null';

    this.deleteFileRef.current.show(file);
  }

  async confirmDeleteFile(file: FileReference): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const {
      projectInfo: { project },
    } = this.state;

    try {
      const path = project.resolve(file.path);

      this.closeTabsForFile(file);
      await sh.promises.rm(path, { recursive: true });

      await this.refreshProject();
      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await this.refreshProject();
        return false;
      }
      if (ex instanceof filer.Errors.ENOENT) {
        await this.refreshProject();
        // close the dialog, the file is gone
        return true;
      }
      console.error(ex);
      throw ex;
    }
  }

  async moveFile(file: FileReference, destDirPath: string): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const {
      projectInfo: { project },
    } = this.state;

    try {
      const path = project.resolve(file.path);
      const newPath = project.resolve(destDirPath, file.file.name);

      this.closeTabsForFile(file);
      await fs.promises.rename(path, newPath);

      await this.refreshProject();
      return true;
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await this.refreshProject();
        return false;
      }
      if (ex instanceof filer.Errors.ENOENT) {
        await this.refreshProject();
        // close the dialog, the file is gone
        return true;
      }
      console.error(ex);
      throw ex;
    }
  }

  async downloadFile(file: FileReference): Promise<void> {
    // eslint-disable-next-line no-throw-literal
    if (this.fileDownloadRef.current === null) throw 'ref is null';
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const fileDownload = this.fileDownloadRef.current;
    const {
      projectInfo: { project },
    } = this.state;

    const path = project.resolve(file.path);
    const content = await fs.promises.readFile(path, 'utf8');

    fileDownload.show(file.file.name, content);
  }

  async uploadFiles(parentDir: DirReference): Promise<void> {
    // eslint-disable-next-line no-throw-literal
    if (this.fileUploadRef.current === null) throw 'ref is null';

    const files = await this.fileUploadRef.current.show();
    if (files.length === 0) return;

    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';

    const {
      projectInfo: { project },
    } = this.state;

    // TODO assumes there's exactly one file
    const file = files[0];

    try {
      const path = project.resolve(parentDir.path, file.name);

      // wrap into the augmented Node-style filer.Buffer object
      const buffer = filer.Buffer.from(await file.arrayBuffer());
      // TODO this overwrites files without warning
      await fs.promises.writeFile(path, buffer);

      await this.refreshProject();
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST) {
        await this.refreshProject();
        return;
      }
      console.error(ex);
      throw ex;
    }
  }

  closeTabsForFile(root: FileReference) {
    const nodes = this.getNodes();
    const { layoutState } = this.state;

    const close = (file: FileReference) => {
      if (file.file.isDirectory()) {
        // $FlowExpectError
        const dir: DirReference = file;
        dir.file.contents.forEach(child =>
          close({ path: `${dir.path}/${child.name}`, file: child }),
        );
      } else if (file.path in nodes) {
        layoutState.doAction(FlexLayout.Actions.deleteTab(file.path));
      }
    };

    close(root);
  }

  render() {
    const { classes } = this.props;
    const {
      projectInfo,
      fileTreeState,
      layoutState,
      showMetadataFolder,
    } = this.state;

    if (projectInfo === null) return null;

    const filter = (path: string, child: FilerRecursiveStatInfo) => {
      if (path === '.' && child.name === '.metadata' && !showMetadataFolder)
        return false;
      return true;
    };

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
                onClick={this.addSimulator}
              >
                <SimulatorIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={<M {...messages.consoleTooltip} />}>
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addConsole}
              >
                <ConsoleIcon />
              </IconButton>
            </Tooltip>
            <PopupState variant="popover" popupId="project-controls-menu">
              {popupState => (
                <>
                  <Tooltip title={<M {...messages.projectSettingsTooltip} />}>
                    <IconButton
                      variant="contained"
                      color="primary"
                      size="small"
                      {...bindTrigger(popupState)}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu keepMounted {...bindMenu(popupState)}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => {
                        popupState.close();
                        this.setState(
                          oldState => ({
                            showMetadataFolder: !oldState.showMetadataFolder,
                          }),
                          () => this.save(),
                        );
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
                </>
              )}
            </PopupState>
            <hr />
          </div>
          <FileTree
            files={projectInfo.files}
            {...fileTreeState}
            filter={filter}
            onFileAction={action => this.handleFileAction(action)}
            onUpdate={
              // eslint-disable-next-line no-shadow
              fileTreeState =>
                this.setState({ fileTreeState }, () => this.save())
            }
          />
          <CreateFileDialog
            ref={this.createFileRef}
            onCreate={(parentNode, name, type) =>
              this.confirmCreateFile(parentNode, name, type)
            }
          />
          <RenameFileDialog
            ref={this.renameFileRef}
            onRename={(file, name) => this.confirmRenameFile(file, name)}
          />
          <DeleteFileDialog
            ref={this.deleteFileRef}
            onDelete={file => this.confirmDeleteFile(file)}
          />
          <FileUpload ref={this.fileUploadRef} />
          <FileDownload ref={this.fileDownloadRef} />
        </Grid>
        {this.state.pluginsLoaded ? (
          <Grid
            item
            component={SquarePaper}
            className={classes.editorContainer}
          >
            <FlexLayout.Layout
              model={layoutState}
              factory={this.factory}
              classNameMapper={className => FlexLayoutTheme[className]}
              onModelChange={() => this.save()}
            />
          </Grid>
        ) : null}
        <Executor ref={this.executorRef} />
      </Grid>
    );
  }
}

export default compose(
  withStyles(FlexLayoutTheme),
  styled,
)(Ide);
