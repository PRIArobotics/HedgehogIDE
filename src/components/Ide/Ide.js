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

const json = {
  global: {},
  borders: [],
  layout: {
    type: 'tabset',
    children: [],
  },
};

type PropTypes = {|
  classes: object,
|};
type StateTypes = {|
  model: any,
|};

class Ide extends React.Component<PropTypes, StateTypes> {
  static factory(node: any) {
    switch (node.getComponent()) {
      case 'editor': {
        return <Editor />;
      }
      case 'simulator': {
        return <Simulator />;
      }
      case 'console': {
        return <Console />;
      }
      case 'blockly': {
        return <VisualEditor id={node.getId()} />;
      }
      default:
        return null;
    }
  }

  constructor(props: PropTypes) {
    super(props);
    Ide.simulatorOn = false;
    const lsJson = JSON.parse(localStorage.getItem('IDELayout'));
    if (localStorage.getItem('IDELayout')) {
      this.state = { model: FlexLayout.Model.fromJson(lsJson.editorState) };
      this.expandedKeys = lsJson.filetree;
    } else {
      this.state = { model: FlexLayout.Model.fromJson(json) };
    }
    this.flexRef = React.createRef();
  }

  getNodes() {
    const nodes = {};

    const enumerateNodes = root => {
      nodes[root.getId()] = root;
      root.getChildren().forEach(child => enumerateNodes(child));
    };

    enumerateNodes(this.state.model.getRoot());

    return nodes;
  }

  fileTreeGet = () => {
    try {
      const lsJson = JSON.parse(localStorage.getItem('IDELayout'));
      console.log(lsJson.filetree);
      return lsJson.filetree.split(',');
    } catch (error) {
      return [];
    }
  };

  fileTreeSave = expandedKeys => {
    this.expandedKeys = '';
    expandedKeys.forEach(item => {
      this.expandedKeys += item;
      this.expandedKeys += ',';
    });
    this.save();
  };

  save = () => {
    const jsonObj = {
      filetree: this.expandedKeys,
      editorState: this.state.model.toJson(),
    };
    localStorage.setItem('IDELayout', JSON.stringify(jsonObj));
  };

  addNode(nodeJson) {
    const nodes = this.getNodes();
    const active = this.state.model.getActiveTabset();

    if (
      active !== undefined &&
      active.getId() in nodes &&
      nodes[active.getId()].getType() === 'tabset'
    ) {
      this.state.model.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          active.getId(),
          FlexLayout.DockLocation.CENTER,
          -1,
        ),
      );
    } else {
      this.state.model.doAction(
        FlexLayout.Actions.addNode(
          nodeJson,
          this.state.model.getRoot().getId(),
          FlexLayout.DockLocation.RIGHT,
          -1,
        ),
      );
    }
  }

  addSimulator() {
    const nodes = this.getNodes();
    if ('sim' in nodes) {
      // TODO assert `nodes.sim.getType() === 'tab'`
      this.state.model.doAction(FlexLayout.Actions.selectTab('sim'));
    } else {
      this.addNode({
        id: 'sim',
        type: 'tab',
        component: 'simulator',
        name: 'Simulator',
      });
    }
  }

  addEditor() {
    this.addNode({
      type: 'tab',
      component: 'editor',
      name: 'Editor',
    });
  }

  addConsole() {
    const nodes = this.getNodes();
    if ('console' in nodes) {
      // TODO assert `nodes.sim.getType() === 'tab'`
      this.state.model.doAction(FlexLayout.Actions.selectTab('console'));
    } else {
      this.addNode({
        id: 'console',
        type: 'tab',
        component: 'console',
        name: 'Console',
      });
    }
  }

  addBlockly() {
    this.addNode({
      type: 'tab',
      component: 'blockly',
      name: 'Visual Editor',
    });
  }

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
                onClick={() => this.addEditor()}
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
                onClick={() => this.addSimulator()}
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
                onClick={() => this.addConsole()}
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
                onClick={() => this.addBlockly()}
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
            model={this.state.model}
            ref={this.flexRef}
            factory={Ide.factory}
            classNameMapper={className => FlexLayoutTheme[className]}
            onModelChange={this.save}
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
