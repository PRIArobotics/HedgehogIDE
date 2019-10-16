/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import React from 'react';
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

import FlexLayout from 'flexlayout-react';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

import Console from '../Console';
import Editor from '../Editor';
import Executor from '../Executor';
import FileTree from '../FileTree';
import Simulator from '../Simulator';
import VisualEditor from '../VisualEditor';

const iconStyles = {
  smallIcon: {
    width: 20,
    height: 20,
  },
  small: {
    width: 38,
    height: 38,
  },
};

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
|};
type StateTypes = {|
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
        return <Simulator />;
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

  flexRef: React.RefObject = React.createRef();

  consoleRef: React.RefObject = React.createRef();

  blocklyTabIds = new Set();

  state = {
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
      // TODO assert `nodes.sim.getType() === 'tab'`
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

  tryPrint = (text: string, stream: string) => {
    this.addConsole();
    if (this.consoleRef.current) {
      this.consoleRef.current.consoleOut(text, 'stdout');
    } else {
      setTimeout(() => this.tryPrint(text, stream), 0);
    }
  };

  handleRunCode = (code: string) => {
    this.setState({ runningCode: `return (async () => {${code}})();` });
  };

  handleStopCode = () => {
    this.setState({ runningCode: null });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Paper className={classes.navContainer} square>
          <div className={classes.navContainerInner}>
            <Tooltip title="Editor">
              <IconButton
                variant="contained"
                color="primary"
                iconStyle={iconStyles.smallIcon}
                style={iconStyles.small}
                onClick={this.addEditor}
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Simulator">
              <IconButton
                variant="contained"
                color="primary"
                iconStyle={iconStyles.smallIcon}
                style={iconStyles.small}
                onClick={this.addSimulator}
              >
                <AddToQueueIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Console">
              <IconButton
                variant="contained"
                color="primary"
                iconStyle={iconStyles.smallIcon}
                style={iconStyles.small}
                onClick={this.addConsole}
              >
                <NotesIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visual Editor">
              <IconButton
                variant="contained"
                color="primary"
                iconStyle={iconStyles.smallIcon}
                style={iconStyles.small}
                onClick={this.addBlockly}
              >
                <CallToActionIcon />
              </IconButton>
            </Tooltip>
            <hr />
          </div>
          <FileTree
            callbackSave={this.fileTreeSave}
            callbackGet={this.fileTreeGet}
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
              print: (source, text) => {
                this.tryPrint(text, 'stdout');
              },
              exit: (source, error) => {
                if (error) this.tryPrint(error, 'stderr');
                this.setState({ runningCode: null });
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
