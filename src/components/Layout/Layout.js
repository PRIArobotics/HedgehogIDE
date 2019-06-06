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
import type { Node } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import s from './Layout.css';
import Header from '../Header';
import Footer from '../Footer';

type PropTypes = {|
  children: Node,
|};

class Layout extends React.Component<PropTypes> {
  render() {
    return (
      <div className={s.root}>
        <Header />
        <div className={s.content}>{this.props.children}</div>
        <Footer />
      </div>
    );
  }
}

export default withStyles(normalizeCss, s)(Layout);
