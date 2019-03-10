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

import Button from '@material-ui/core/Button';

import s from './Ide.css';

type PropTypes = {||};

class Ide extends React.Component<PropTypes> {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Button variant="contained" color="primary">
            IDE
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Ide);
