// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'react-apollo';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles as withStylesMaterial } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import filer, { fs } from 'filer';

import FlexLayout from 'flexlayout-react';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

import { ConsoleIcon, SimulatorIcon } from '../../misc/palette';

import Console from '../Console';
import Editor from '../Editor';
import Executor from '../Executor';
import FileTab from '../FileTab';
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

import {
  type FilerRecursiveStatInfo,
  type FilerRecursiveDirectoryInfo,
  Project,
} from '../../../core/store/projects';

import CreateFileDialog from '../FileTree/CreateFileDialog';
import RenameFileDialog from '../FileTree/RenameFileDialog';
import DeleteFileDialog from '../FileTree/DeleteFileDialog';

const sh = new fs.Shell();

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
  layoutState: FlexLayout.Model,
  blocklyState: { [key: string]: VisualEditorState },
  runningCode: string | null,
|};

type OpenOrFocusTabOptions = {|
  location?: FlexLayout.DockLocation,
  alwaysNewTabset?: boolean,
|};

const SquarePaper = props => <Paper square {...props} />;

class Ide extends React.Component<PropTypes, StateTypes> {
  factory = (node: any) => {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'unreachable';
    const { project } = this.state.projectInfo;

    const id = node.getId();
    switch (node.getComponent()) {
      case 'editor': {
        return (
          <FileTab project={project} path={id}>
            {(content, onContentChange) => (
              <Editor
                layoutNode={node}
                content={content}
                onContentChange={onContentChange}
                onExecute={code => this.handleExecute(code)}
                onTerminate={() => this.handleTerminate()}
                running={!!this.state.runningCode}
              />
            )}
          </FileTab>
        );
      }
      case 'simulator': {
        return (
          <Simulator
            width={600}
            height={400}
            forwardedRef={this.simulatorRef}
          />
        );
      }
      case 'console': {
        return <Console forwardedRef={this.consoleRef} />;
      }
      case 'blockly': {
        return (
          <FileTab project={project} path={id}>
            {(content, onContentChange) => (
              <VisualEditor
                layoutNode={node}
                content={content}
                onContentChange={onContentChange}
                {...this.state.blocklyState[id]}
                onUpdate={state => {
                  this.setState(
                    oldState => ({
                      blocklyState: {
                        ...oldState.blocklyState,
                        [id]: {
                          ...oldState.blocklyState[id],
                          ...state,
                        },
                      },
                    }),
                    () => this.save(),
                  );
                }}
                onExecute={code => this.handleExecute(code)}
                onTerminate={() => this.handleTerminate()}
                running={!!this.state.runningCode}
              />
            )}
          </FileTab>
        );
      }
      default:
        return null;
    }
  };

  flexRef: RefObject<typeof FlexLayout.Layout> = React.createRef();
  consoleRef: RefObject<typeof Console> = React.createRef();
  simulatorRef: RefObject<typeof Simulator> = React.createRef();

  createFileRef: RefObject<typeof CreateFileDialog> = React.createRef();
  renameFileRef: RefObject<typeof RenameFileDialog> = React.createRef();
  deleteFileRef: RefObject<typeof DeleteFileDialog> = React.createRef();

  blocklyTabIds = new Set();

  state = {
    projectInfo: null,
    fileTreeState: {},
    layoutState: FlexLayout.Model.fromJson(defaultLayout),
    blocklyState: {},
    runningCode: null,
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
      layoutState: defaultLayout,
      blocklyState: {},
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
      layoutState: layoutStateJson,
      blocklyState,
    } = persistentState;
    const layoutState = FlexLayout.Model.fromJson(layoutStateJson);

    const projectInfo = { project, files, projectUid };
    this.setState({ projectInfo, fileTreeState, layoutState, blocklyState });
  }

  save() {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'projectInfo is null';
    // eslint-disable-next-line no-shadow
    const {
      projectInfo: { projectUid },
      fileTreeState,
      layoutState: layoutStateModel,
      blocklyState,
    } = this.state;
    const layoutState = layoutStateModel.toJson();

    localStorage.setItem(
      `IDE-State-${projectUid}`,
      JSON.stringify({ fileTreeState, layoutState, blocklyState }),
    );
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

  addSimulator = () =>
    this.openOrFocusTab({
      id: 'sim',
      type: 'tab',
      component: 'simulator',
      name: 'Simulator',
    });

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

  getSimulator = () =>
    new Promise(resolve => {
      const tryIt = () => {
        this.addSimulator();
        if (this.simulatorRef.current) {
          resolve(this.simulatorRef.current);
        } else {
          setTimeout(tryIt, 0);
        }
      };
      tryIt();
    });

  handleExecute(code: string) {
    this.setState({ runningCode: `return (async () => {${code}})();` });
  }

  handleTerminate() {
    this.setState({ runningCode: null });
    (async () => {
      (await this.getSimulator()).robot.setSpeed(0, 0);
    })();
  }

  handleFileAction(action: FileAction) {
    switch (action.action) {
      case 'CREATE': {
        const { parentDir, desc } = action;
        this.beginCreateFile(parentDir, desc);
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
        this.openOrFocusTab({
          id: path,
          type: 'tab',
          component: file.name.endsWith('.blockly') ? 'blockly' : 'editor',
          name: file.name,
        });
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
    const { projectInfo } = this.state;

    if (projectInfo === null) return null;

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
            <Tooltip title="Simulator">
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addSimulator}
              >
                <SimulatorIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Console">
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addConsole}
              >
                <ConsoleIcon />
              </IconButton>
            </Tooltip>
            <hr />
          </div>
          <FileTree
            files={projectInfo.files}
            {...this.state.fileTreeState}
            onFileAction={action => this.handleFileAction(action)}
            onUpdate={fileTreeState =>
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
        </Grid>
        <Grid item component={SquarePaper} className={classes.editorContainer}>
          <FlexLayout.Layout
            model={this.state.layoutState}
            ref={this.flexRef}
            factory={this.factory}
            classNameMapper={className => FlexLayoutTheme[className]}
            onModelChange={() => this.save()}
          />
        </Grid>
        {this.state.runningCode ? (
          <Executor
            code={this.state.runningCode}
            handlers={{
              print: async text => {
                (await this.getConsole()).consoleOut(text, 'stdout');
              },
              moveMotor: async ({ port, power }, executor) => {
                await executor.withReply(async () => {
                  (await this.getSimulator()).robot.moveMotor(port, power);
                });
              },
              setServo: async ({ port, position }, executor) => {
                await executor.withReply(async () => {
                  (await this.getSimulator()).robot.setServo(port, position);
                });
              },
              getAnalog: async ({ port }, executor) => {
                await executor.withReply(async () =>
                  (await this.getSimulator()).robot.getAnalog(port),
                );
              },
              getDigital: async ({ port }, executor) => {
                await executor.withReply(async () =>
                  (await this.getSimulator()).robot.getDigital(port),
                );
              },
              exit: async error => {
                this.setState({ runningCode: null });
                // TODO the robot may continue to move here
                // stopping might be a good idea, but might mask the fact that
                // the program is missing an explicit stop command
                if (error) {
                  (await this.getConsole()).consoleOut(error, 'stderr');
                }
              },
            }}
          />
        ) : null}
      </Grid>
    );
  }
}

export default compose(
  withStyles(FlexLayoutTheme),
  styled,
)(Ide);
