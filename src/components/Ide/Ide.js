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
import Button from '@material-ui/core/Button';
import { withStyles as withStylesMaterial } from '@material-ui/styles';

import FlexLayout from 'flexlayout-react';
import Editor from '../Editor';
import Simulator from '../Simulator';

// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

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
// JSON (Daten) von Tabs
const json = {
  global: {},
  borders: [],
  layout: {
    type: 'row',
    weight: 50,
    children: [
      {
        type: 'tabset',
        id: 'left',
        weight: 50,
        selected: 0,
        children: [
          {
            type: 'tab',
            name: 'A', // Name für tab
            component: 'editor',
          },
        ],
      },
      {
        type: 'tabset',
        weight: 50,
        selected: 0,
        children: [
          {
            type: 'tab',
            name: 'B',
            component: 'editor',
          },
        ],
      },
    ],
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
      default:
        return null;
    }
  }

  constructor(props: PropTypes) {
    super(props);
    this.state = {
      model: FlexLayout.Model.fromJson(json),
    };
  }

  handleClick() {
    console.log("CLICK");
    this.refs.layout.addTabToTabSet("left", {type:"tab", component:"simulator", name:"Simulator"});
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Paper className={classes.navContainer} square>
          <div className={classes.navContainerInner}>
            <Button variant="contained" color="primary">
              IDE
            </Button>
            <br />
            <br />
            <Button variant="contained" color="primary" onClick={(e) => this.handleClick(e)}>
              Simulator
            </Button>
          </div>
        </Paper>
        <Paper className={classes.editorContainer} square>
          <FlexLayout.Layout
            model={this.state.model}
            ref = "layout"
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
