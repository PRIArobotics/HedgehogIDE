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
import FileTree from '../FileTree';
import Simulator from '../Simulator';
import VisualEditor from '../VisualEditor';

import type {
  FilerRecursiveStatInfo,
  FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';
import { Project, ProjectError } from '../../../core/store/projects';

import type {
  FileAction,
  ControlledState as FileTreeState,
} from '../FileTree/FileTree';
import type { RcTreeNodeEvent } from '../FileTree/RcTreeTypes';
import type { ControlledState as TextualEditorState } from '../Editor';
import type { ControlledState as VisualEditorState } from '../VisualEditor';
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
  project: Project | null,
  files: Array<FilerRecursiveStatInfo> | null,
  projectUid: string | null,
  fileTreeState: FileTreeState,
  layoutState: FlexLayout.Model,
  blocklyState: { [key: string]: VisualEditorState },
  aceState: { [key: string]: TextualEditorState },
  runningCode: string | null,
|};

class Ide extends React.Component<PropTypes, StateTypes> {
  factory = (node: any) => {
    const id = node.getId();
    switch (node.getComponent()) {
      case 'editor': {
        return (
          <Editor
            layoutNode={node}
            {...this.state.aceState[id]}
            onUpdate={state => {
              this.setState(
                oldState => ({
                  aceState: {
                    ...oldState.aceState,
                    [id]: {
                      ...oldState.aceState[id],
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
          <VisualEditor
            layoutNode={node}
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
    project: null,
    files: null,
    projectUid: null,
    fileTreeState: {},
    layoutState: FlexLayout.Model.fromJson(defaultLayout),
    blocklyState: {},
    aceState: {},
    runningCode: null,
  };

  constructor(props: PropTypes) {
    super(props);

    this.refreshProject();

    // legacy loading of editor state
    const json = localStorage.getItem('IDELayout');
    if (json) {
      const { blocklyState, aceState } = JSON.parse(json);
      Object.assign(this.state, {
        blocklyState,
        aceState,
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
      : {};
    const layoutState = FlexLayout.Model.fromJson(
      layoutStateJson || defaultLayout,
    );

    this.setState({ project, files, projectUid, fileTreeState, layoutState });
  }

  save() {
    // eslint-disable-next-line no-throw-literal
    if (this.state.projectUid === null) throw 'projectUid is null';
    // eslint-disable-next-line no-shadow
    const {
      projectUid,
      fileTreeState,
      layoutState: layoutStateModel,
    } = this.state;
    const layoutState = layoutStateModel.toJson();

    localStorage.setItem(
      `IDE-State-${projectUid}`,
      JSON.stringify({ fileTreeState, layoutState }),
    );

    // legacy saving of editor state
    const { blocklyState, aceState } = this.state;
    localStorage.setItem(
      'IDELayout',
      JSON.stringify({
        blocklyState,
        aceState,
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

  addNode(nodeJson) {
    const nodes = this.getNodes();
    const active = this.state.layoutState.getActiveTabset();

    if (
      active !== undefined &&
      active.getId() in nodes &&
      nodes[active.getId()].getType() === 'tabset'
    ) {
      this.state.layoutState.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          active.getId(),
          FlexLayout.DockLocation.CENTER,
          -1,
        ),
      );
    } else {
      this.state.layoutState.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          this.state.layoutState.getRoot().getId(),
          FlexLayout.DockLocation.RIGHT,
          -1,
        ),
      );
    }
  }

  addSimulator = () => {
    const nodes = this.getNodes();
    if ('sim' in nodes) {
      // TODO assert `nodes.sim.getType() === 'tab'`
      this.state.layoutState.doAction(FlexLayout.Actions.selectTab('sim'));
    } else {
      this.addNode({
        id: 'sim',
        type: 'tab',
        component: 'simulator',
        name: 'Simulator',
      });
    }
  };

  addEditor = () => {
    this.addNode({
      type: 'tab',
      component: 'editor',
      name: 'Editor',
    });
  };

  addConsole = () => {
    const nodes = this.getNodes();
    if ('console' in nodes) {
      // TODO assert `nodes.console.getType() === 'tab'`
      this.state.layoutState.doAction(FlexLayout.Actions.selectTab('console'));
    } else {
      this.addNode({
        id: 'console',
        type: 'tab',
        component: 'console',
        name: 'Console',
      });
    }
  };

  addBlockly = () => {
    this.addNode({
      type: 'tab',
      component: 'blockly',
      name: 'Visual Editor',
    });
  };

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

  handleFileAction(node: RcTreeNodeEvent, action: FileAction) {
    switch (action) {
      case 'CREATE_FOLDER':
        this.beginCreateFile(node, 'DIRECTORY');
        break;
      case 'CREATE_FILE':
        this.beginCreateFile(node, 'FILE');
        break;
      case 'RENAME':
        this.beginRenameFile(node);
        break;
      case 'DELETE':
        this.beginDeleteFile(node);
        break;
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  beginCreateFile(parentNode: RcTreeNodeEvent, type: 'FILE' | 'DIRECTORY') {
    // eslint-disable-next-line no-throw-literal
    if (this.createFileRef.current === null) throw 'ref is null';

    this.createFileRef.current.show(parentNode, type);
  }

  async confirmCreateFile(
    parentNode: RcTreeNodeEvent,
    name: string,
    type: 'FILE' | 'DIRECTORY',
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.project === null) throw 'unreachable';

    const { project } = this.state;

    try {
      const path = project.resolve(parentNode.props.eventKey, name);

      if (type === 'FILE') await fs.promises.mknod(path, 'FILE');
      else await fs.promises.mkdir(path);

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

  beginRenameFile(file: RcTreeNodeEvent) {
    // split off the './' at the start and the file name at the end
    const path = file.props.eventKey.split('/').slice(1, -1);

    // eslint-disable-next-line no-throw-literal
    if (this.state.files === null) throw 'unreachable';
    let { files } = this.state;

    // determine the files that are siblings of the event target
    path.forEach(fragment => {
      const child = files.find(c => c.name === fragment);
      // eslint-disable-next-line no-throw-literal
      if (child === undefined || !child.isDirectory()) throw 'unreachable';
      // $FlowExpectError
      const childDir: FilerRecursiveDirectoryInfo = child;
      files = childDir.contents;
    });

    // eslint-disable-next-line no-throw-literal
    if (this.renameFileRef.current === null) throw 'ref is null';
    this.renameFileRef.current.show(file, files);
  }

  async confirmRenameFile(
    file: RcTreeNodeEvent,
    newName: string,
  ): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.project === null) throw 'unreachable';

    const { project } = this.state;

    try {
      const path = project.resolve(file.props.eventKey);
      const newPath = project.resolve(file.props.eventKey, '..', newName);

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

  beginDeleteFile(file: RcTreeNodeEvent) {
    // eslint-disable-next-line no-throw-literal
    if (this.deleteFileRef.current === null) throw 'ref is null';

    this.deleteFileRef.current.show(file);
  }

  async confirmDeleteFile(file: RcTreeNodeEvent): Promise<boolean> {
    // eslint-disable-next-line no-throw-literal
    if (this.state.project === null) throw 'unreachable';

    const { project } = this.state;

    try {
      const path = project.resolve(file.props.eventKey);

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

  render() {
    const { classes, projectName } = this.props;
    const { files } = this.state;

    if (files === null) return null;

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
            projectName={projectName}
            files={files}
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
