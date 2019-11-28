// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'react-apollo';

import Paper from '@material-ui/core/Paper';
import { withStyles as withStylesMaterial } from '@material-ui/styles';
import CodeIcon from '@material-ui/icons/Code';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import NotesIcon from '@material-ui/icons/Notes';
import CallToActionIcon from '@material-ui/icons/CallToAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import filer, { fs } from 'filer';

import FlexLayout from 'flexlayout-react';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

import Console from '../Console';
import Editor from '../Editor';
import Executor from '../Executor';
import FileTab from '../FileTab';
import FileTree, {
  type DirReference,
  type FileReference,
  type FileAction,
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
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  navContainer: {
    flex: '0 auto',
    minWidth: '150px',
    marginRight: theme.spacing(1),
    overflow: 'auto',
  },
  navContainerInner: {
    padding: theme.spacing(1),
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
            width={640}
            height={480}
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

    // legacy loading of editor state
    const json = localStorage.getItem('IDELayout');
    if (json) {
      const { blocklyState } = JSON.parse(json);
      Object.assign(this.state, {
        blocklyState,
      });
    }
  }

  async refreshProject() {
    const project = await Project.getProject(this.props.projectName);
    const files = await project.getFiles();
    const projectUid = await project.getUid();

    const json = localStorage.getItem(`IDE-State-${projectUid}`);
    const { fileTreeState, layoutState: layoutStateJson } = json
      ? JSON.parse(json)
      : {
          fileTreeState: { expandedKeys: [] },
          layoutState: defaultLayout,
        };
    const layoutState = FlexLayout.Model.fromJson(layoutStateJson);

    const projectInfo = { project, files, projectUid };
    this.setState({ projectInfo, fileTreeState, layoutState });
  }

  save() {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectInfo === null) throw 'projectInfo is null';
    // eslint-disable-next-line no-shadow
    const {
      projectInfo: { projectUid },
      fileTreeState,
      layoutState: layoutStateModel,
    } = this.state;
    const layoutState = layoutStateModel.toJson();

    localStorage.setItem(
      `IDE-State-${projectUid}`,
      JSON.stringify({ fileTreeState, layoutState }),
    );

    // legacy saving of editor state
    const { blocklyState } = this.state;
    localStorage.setItem(
      'IDELayout',
      JSON.stringify({
        blocklyState,
      }),
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

  addEditor = () =>
    this.openOrFocusTab({
      id: 'editor',
      type: 'tab',
      component: 'editor',
      name: 'Editor',
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

  addBlockly = () =>
    this.openOrFocusTab({
      id: 'blockly',
      type: 'tab',
      component: 'blockly',
      name: 'Visual Editor',
    });

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
  }

  handleFileAction(file: FileReference, action: FileAction) {
    switch (action) {
      case 'CREATE_FOLDER': {
        // $FlowExpectError
        const dir: DirReference = file;
        this.beginCreateFile(dir, 'DIRECTORY');
        break;
      }
      case 'CREATE_FILE': {
        // $FlowExpectError
        const dir: DirReference = file;
        this.beginCreateFile(dir, 'FILE');
        break;
      }
      case 'RENAME':
        this.beginRenameFile(file);
        break;
      case 'DELETE':
        this.beginDeleteFile(file);
        break;
      case 'OPEN':
        this.openOrFocusTab({
          id: file.path,
          type: 'tab',
          component: file.file.name.endsWith('.blockly') ? 'blockly' : 'editor',
          name: file.file.name,
        });
        break;
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  beginCreateFile(parentDir: DirReference, type: FileType) {
    // eslint-disable-next-line no-throw-literal
    if (this.createFileRef.current === null) throw 'ref is null';

    this.createFileRef.current.show(parentDir, type);
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
      <div className={classes.root}>
        <Paper className={classes.navContainer} square>
          <div className={classes.navContainerInner}>
            <Tooltip title="Editor">
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addEditor}
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Simulator">
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addSimulator}
              >
                <AddToQueueIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Console">
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addConsole}
              >
                <NotesIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visual Editor">
              <IconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.addBlockly}
              >
                <CallToActionIcon />
              </IconButton>
            </Tooltip>
            <hr />
          </div>
          <FileTree
            files={projectInfo.files}
            {...this.state.fileTreeState}
            onFileAction={(node, action) => this.handleFileAction(node, action)}
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
        </Paper>
        <Paper className={classes.editorContainer} square>
          <FlexLayout.Layout
            model={this.state.layoutState}
            ref={this.flexRef}
            factory={this.factory}
            classNameMapper={className => FlexLayoutTheme[className]}
            onModelChange={() => this.save()}
          />
        </Paper>
        {this.state.runningCode ? (
          <Executor
            code={this.state.runningCode}
            handlers={{
              print: async (source, text) => {
                (await this.getConsole()).consoleOut(text, 'stdout');
              },
              move: async (source, { left, right }) => {
                (await this.getSimulator()).robot.setSpeed(left, right);
              },
              exit: async (source, error) => {
                this.setState({ runningCode: null });
                if (error) {
                  (await this.getConsole()).consoleOut(error, 'stderr');
                }
              },
            }}
          />
        ) : null}
      </div>
    );
  }
}

export default compose(
  withStyles(FlexLayoutTheme),
  styled,
)(Ide);
