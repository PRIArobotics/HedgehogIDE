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

import Editor from '../Editor';

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
    padding: theme.spacing(1),
  },
  editorContainer: {
    flex: '1 auto',
    position: 'relative',
  },
}));

const importer = (async () => {
  if (!process.env.BROWSER) {
    // never resolves
    await new Promise(() => {});
  }
  // import flexlayout
  return {
    FlexLayout: await import('flexlayout-react'),
  };
})();

const json = {
  global: {},
  borders: [],
  layout: {
    type: 'row',
    weight: 50,
    children: [
      {
        type: 'tabset',
        weight: 50,
        selected: 0,
        children: [
          {
            type: 'tab',
            name: 'A',
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
      default:
        return null;
    }
  }

  constructor(props: PropTypes) {
    super(props);
    this.state = {
      model: null,
    };
  }

  componentDidMount() {
    // FIXME work around FlexLayout's incompatibility with server-side rendering
    importer.then(({ FlexLayout }) => {
      this.FlexLayout = FlexLayout;
      this.setState({
        model: this.FlexLayout.Model.fromJson(json),
      });
    });
  }

  FlexLayout: any;

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Paper className={classes.navContainer} square>
          <Button variant="contained" color="primary">
            IDE
          </Button>
        </Paper>
        {this.state.model && (
          <Paper className={classes.editorContainer} square>
            <this.FlexLayout.Layout
              model={this.state.model}
              factory={Ide.factory}
              classNameMapper={className => FlexLayoutTheme[className]}
            />
          </Paper>
        )}
      </div>
    );
  }
}

export default compose(
  styled,
  withStyles(FlexLayoutTheme),
)(Ide);
