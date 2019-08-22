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
import Editor from '../Editor';
import Simulator from '../Simulator';
import Console from '../Console';
import VisualEditor from '../VisualEditor';

// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';
import FileTree from '../FileTree/FileTree';

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

type PropTypes = {|
  classes: Object,
|};
type StateTypes = {|
  layoutModel: FlexLayout.Model,
|};

class Ide extends React.Component<PropTypes, StateTypes> {
  factory = (node: any) => {
    const id = node.getId();
    switch (node.getComponent()) {
      case 'editor': {
        return (
          <Editor
            id={id}
            callbackGet={this.editorGet}
            callbackSave={this.editorSave}
          />
        );
      }
      case 'simulator': {
        return <Simulator />;
      }
      case 'console': {
        return <Console />;
      }
      case 'blockly': {
        return (
          <VisualEditor
            callbackGet={() => this.blocklyGet(id)}
            callbackSave={workspace => this.blocklySave(workspace, id)}
          />
        );
      }
      default:
        return null;
    }
  };

  flexRef: React.RefObject = React.createRef();

  blocklyTabIds = new Set();

  constructor(props: PropTypes) {
    super(props);

    const json = localStorage.getItem('IDELayout');
    if (json) {
      const { layoutState, fileTreeState, blocklyState, aceState } = JSON.parse(json);
      this.state = { layoutModel: FlexLayout.Model.fromJson(layoutState) };
      this.fileTreeState = fileTreeState;
      this.blocklyState = blocklyState;
      this.aceState = aceState;
    } else {
      this.state = { layoutModel: FlexLayout.Model.fromJson(defaultLayout) };
      this.fileTreeState = {};
      this.blocklyState = {};
      this.aceState = {};
    }
  }

  save() {
    localStorage.setItem(
      'IDELayout',
      JSON.stringify({
        layoutState: this.state.layoutModel.toJson(),
        fileTreeState: this.fileTreeState,
        blocklyState: this.blocklyState,
        aceState: this.aceState,
      }),
    );
  }

  getNodes() {
    const nodes = {};

    this.state.layoutModel.visitNodes(node => {
      nodes[node.getId()] = node;
    });

    return nodes;
  }

  addNode(nodeJson) {
    const nodes = this.getNodes();
    const active = this.state.layoutModel.getActiveTabset();

    if (
      active !== undefined &&
      active.getId() in nodes &&
      nodes[active.getId()].getType() === 'tabset'
    ) {
      this.state.layoutModel.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          active.getId(),
          FlexLayout.DockLocation.CENTER,
          -1,
        ),
      );
    } else {
      this.state.layoutModel.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          this.state.layoutModel.getRoot().getId(),
          FlexLayout.DockLocation.RIGHT,
          -1,
        ),
      );
    }
  }

  updateBlocklyTabs() {
    this.state.layoutModel.visitNodes(node => {
      if (node.getType() !== 'tab' || node.getComponent() !== 'blockly') return;

      const id = node.getId();
      if (!this.blocklyTabIds.has(id)) {
        this.blocklyTabIds.add(id);

        node.setEventListener('close', () => {
          this.blocklyTabIds.delete(id);
        });
        node.setEventListener('resize', () => {
          // TODO
        });
      }
    });
  }

  fileTreeGet = () => this.fileTreeState;

  fileTreeSave = fileTreeState => {
    this.fileTreeState = fileTreeState;
    this.save();
  };

  blocklyGet = id => this.blocklyState[id];

  blocklySave = (workspace, id) => {
    this.blocklyState[id] = workspace;
    this.save();
  };

  editorGet = id => this.aceState[id];

  editorSave = (text, id) => {
    this.aceState[id] = text;
    this.save();
  };

  handleLayoutModelChange = () => {
    this.updateBlocklyTabs();
    this.save();
  };

  addSimulator = () => {
    const nodes = this.getNodes();
    if ('sim' in nodes) {
      // TODO assert `nodes.sim.getType() === 'tab'`
      this.state.layoutModel.doAction(FlexLayout.Actions.selectTab('sim'));
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
      this.state.layoutModel.doAction(FlexLayout.Actions.selectTab('console'));
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
            model={this.state.layoutModel}
            ref={this.flexRef}
            factory={this.factory}
            classNameMapper={className => FlexLayoutTheme[className]}
            onModelChange={this.handleLayoutModelChange}
          />
        </Paper>
      </div>
    );
  }
}

export default compose(
  withStyles(FlexLayoutTheme),
  styled,
)(Ide);
