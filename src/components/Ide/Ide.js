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

// $FlowExpectError
import Button from '@material-ui/core/Button';
import Editor from '../Editor';

import s from './Ide.css';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

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
            component: 'button',
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

type PropTypes = {||};
type StateTypes = {|
  model: any,
|};

class Ide extends React.Component<PropTypes, StateTypes> {
  static factory(node: any) {
    switch (node.getComponent()) {
      case 'button': {
        return (
          <div className={s.tab}>
            <Button variant="contained" color="primary">
              IDE
            </Button>
          </div>
        );
      }
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
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s['nav-container']}>
            <p>nav</p>
          </div>
          {this.state.model && (
            <div className={s['editor-container']}>
              <this.FlexLayout.Layout
                model={this.state.model}
                factory={Ide.factory}
                classNameMapper={className => FlexLayoutTheme[className]}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s, FlexLayoutTheme)(Ide);
