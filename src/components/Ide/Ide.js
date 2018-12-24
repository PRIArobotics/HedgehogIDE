/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Button from '@material-ui/core/Button';

import s from './Ide.css';
// eslint-disable-next-line css-modules/no-unused-class
import FlexLayoutTheme from './flex_layout_ide.css';

// FIXME work around FlexLayout's incompatibility with server-side rendering
// if we're not in the browser, use a "never" promise
const FlexLayoutP = process.env.BROWSER
  ? import('flexlayout-react')
  : new Promise(() => {});

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
            component: 'button',
          },
        ],
      },
    ],
  },
};

class Ide extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    FlexLayoutP.then(FlexLayout => {
      // if we're not in the browser, this will never run
      this.FlexLayout = FlexLayout;
      this.setState({
        model: this.FlexLayout.Model.fromJson(json),
      });
    });
  }

  factory = node => {
    switch (node.getComponent()) {
      case 'button': {
        return (
          <Button variant="contained" color="primary">
            IDE
          </Button>
        );
      }
      default:
        return null;
    }
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.state.model && (
            <div className={s['flexlayout-container']}>
              <this.FlexLayout.Layout
                model={this.state.model}
                factory={this.factory}
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
