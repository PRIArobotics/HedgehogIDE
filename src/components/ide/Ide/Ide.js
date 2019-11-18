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

import { Project, ProjectError } from '../../../core/store/projects';

import type { FileAction } from '../FileTree/FileTree';
import type { RcTreeNodeEvent } from '../FileTree/RcTreeTypes';
import CreateFileDialog from '../FileTree/CreateFileDialog';
import RenameFileDialog from '../FileTree/RenameFileDialog';

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

type PersistentState = {|
  layoutState: FlexLayout.Model,
  fileTreeState: Object,
  blocklyState: Object,
  aceState: Object,
|};

type PropTypes = {|
  classes: Object,
  projectName: string,
|};
type StateTypes = {|
  project: Project | null,
  files: Array<any> | null,
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
            callbackGet={() => this.editorGet(id)}
            callbackSave={workspace => this.editorSave(workspace, id)}
            callbackRun={code => this.handleRunCode(code)}
            callbackStop={() => this.handleStopCode()}
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
            callbackGet={() => this.blocklyGet(id)}
            callbackSave={workspace => this.blocklySave(workspace, id)}
            callbackRun={code => this.handleRunCode(code)}
            callbackStop={() => this.handleStopCode()}
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

  blocklyTabIds = new Set();

  state = {
    project: null,
    files: null,
    runningCode: null,
  };

  persistentState: PersistentState = {
    layoutState: FlexLayout.Model.fromJson(defaultLayout),
    fileTreeState: {},
    blocklyState: {},
    aceState: {},
  };

  constructor(props: PropTypes) {
    super(props);

    this.refreshProject();

    const json = localStorage.getItem('IDELayout');
    if (json) {
      const { layoutState, fileTreeState, blocklyState, aceState } = JSON.parse(
        json,
      );
      Object.assign(this.persistentState, {
        layoutState: FlexLayout.Model.fromJson(layoutState),
        fileTreeState,
        blocklyState,
        aceState,
      });
    }
  }

  async refreshProject() {
    const project = await Project.getProject(this.props.projectName);
    const files = await project.getFiles();
    this.setState({ project, files });
  }

  save() {
    const {
      layoutState,
      fileTreeState,
      blocklyState,
      aceState,
    } = this.persistentState;
    localStorage.setItem(
      'IDELayout',
      JSON.stringify({
        layoutState: layoutState.toJson(),
        fileTreeState,
        blocklyState,
        aceState,
      }),
    );
  }

  getNodes() {
    const nodes = {};

    this.persistentState.layoutState.visitNodes(node => {
      nodes[node.getId()] = node;
    });

    return nodes;
  }

  addNode(nodeJson) {
    const nodes = this.getNodes();
    const active = this.persistentState.layoutState.getActiveTabset();

    if (
      active !== undefined &&
      active.getId() in nodes &&
      nodes[active.getId()].getType() === 'tabset'
    ) {
      this.persistentState.layoutState.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          active.getId(),
          FlexLayout.DockLocation.CENTER,
          -1,
        ),
      );
    } else {
      this.persistentState.layoutState.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          this.persistentState.layoutState.getRoot().getId(),
          FlexLayout.DockLocation.RIGHT,
          -1,
        ),
      );
    }
  }

  fileTreeGet = () => this.persistentState.fileTreeState;

  fileTreeSave = fileTreeState => {
    this.persistentState.fileTreeState = fileTreeState;
    this.save();
  };

  blocklyGet = id => this.persistentState.blocklyState[id];

  blocklySave = (workspace, id) => {
    this.persistentState.blocklyState[id] = workspace;
    this.save();
  };

  editorGet = id => this.persistentState.aceState[id];

  editorSave = (text, id) => {
    this.persistentState.aceState[id] = text;
    this.save();
  };

  handleLayoutModelChange = () => {
    this.save();
  };

  addSimulator = () => {
    const nodes = this.getNodes();
    if ('sim' in nodes) {
      // TODO assert `nodes.sim.getType() === 'tab'`
      this.persistentState.layoutState.doAction(
        FlexLayout.Actions.selectTab('sim'),
      );
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
      this.persistentState.layoutState.doAction(
        FlexLayout.Actions.selectTab('console'),
      );
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

  handleRunCode = (code: string) => {
    this.setState({ runningCode: `return (async () => {${code}})();` });
  };

  handleStopCode = () => {
    this.setState({ runningCode: null });
  };

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
        // TODO
        // eslint-disable-next-line no-throw-literal
        throw 'unimplemented';
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
    let files = this.state.files;

    // determine the files that are siblings of the event target
    for (let fragment of path) {
      const child = files.find(child => child.name === fragment);
      if (child === undefined) throw 'unreachable';
      files = child.contents;
    }

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
            onFileAction={(node, action) => this.handleFileAction(node, action)}
            callbackSave={this.fileTreeSave}
            callbackGet={this.fileTreeGet}
          />
          <CreateFileDialog
            ref={this.createFileRef}
            onCreate={(parentNode, name, type) =>
              this.confirmCreateFile(parentNode, name, type)
            }
          />
          <RenameFileDialog
            ref={this.renameFileRef}
            onRename={(file, name) =>
              this.confirmRenameFile(file, name)
            }
          />
        </Paper>
        <Paper className={classes.editorContainer} square>
          <FlexLayout.Layout
            model={this.persistentState.layoutState}
            ref={this.flexRef}
            factory={this.factory}
            classNameMapper={className => FlexLayoutTheme[className]}
            onModelChange={this.handleLayoutModelChange}
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
