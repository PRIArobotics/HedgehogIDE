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
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import FlexLayout from 'flexlayout-react';
import Editor from '../Editor';
import Simulator from '../Simulator';

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
  static simulatorOn;

  static factory(node: any) {
    switch (node.getComponent()) {
      case 'editor': {
        return <Editor />;
      }
      case 'simulator': {
        node.setEventListener('close', () => {
          Ide.simulatorOn = false;
        });
        return <Simulator />;
      }
      default:
        return null;
    }
  }

  constructor(props: PropTypes) {
    super(props);
    Ide.simulatorOn = false;
    this.state = { model: FlexLayout.Model.fromJson(json) };
    this.flexRef = React.createRef();
  }

  addNode(nodeJson) {
    // TODO this is a workaround for a FlexLayout bug
    const enumerateTabsetIds = (tabsets, root) => {
      tabsets.push(root.getId());
      root.getChildren().forEach(child => enumerateTabsetIds(tabsets, child));
      return tabsets;
    };

    const allTabsetIds = enumerateTabsetIds([], this.state.model.getRoot());
    const active = this.state.model.getActiveTabset();

    if (active !== undefined && allTabsetIds.indexOf(active.getId()) !== -1) {
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
    if (Ide.simulatorOn === false) {
      this.addNode({
        id: 'sim',
        type: 'tab',
        component: 'simulator',
        name: 'Simulator',
      });
      Ide.simulatorOn = true;
    } else {
      this.state.model.doAction(FlexLayout.Actions.selectTab('sim'));
    }
  }

  addEditor() {
    this.addNode({
      type: 'tab',
      component: 'editor',
      name: 'Editor',
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Paper className={classes.navContainer} square>
          <div className={classes.navContainerInner}>
            <Tooltip title="IDE">
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
            <Tooltip title="Simulation">
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
          </div>
          <FileTree />
        </Paper>
        <Paper className={classes.editorContainer} square>
          <FlexLayout.Layout
            model={this.state.model}
            ref={this.flexRef}
            factory={Ide.factory}
            classNameMapper={className => FlexLayoutTheme[className]}
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
