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

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/styles';

import SvgIcon from '../misc/SvgIcon';
import logoUrl from './logo.svg';

const styled = withStyles({
  brandTxt: {
    marginLeft: '10px',
  },
});

type PropTypes = {|
  classes: object,
|};

class Header extends React.Component<PropTypes> {
  render() {
    const { classes } = this.props;

    return (
      <AppBar>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="Hedgehog">
            <SvgIcon src={logoUrl} alt="Hedgehog Logo" />
          </IconButton>
          <Typography className={classes.brandTxt} variant="h6">
            Hedgehog IDE
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default styled(Header);
