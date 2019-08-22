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

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/styles';

import Link from '../misc/Link';
import SvgIcon from '../misc/SvgIcon';
import logoUrl from './logo.svg';

// eslint-disable-next-line no-unused-vars
const styled = withStyles(theme => ({
  gutters: {
    paddingLeft: theme.spacing(2),
  },
  brandTxt: {
    marginLeft: '10px',
  },
}));

type PropTypes = {|
  classes: Object,
|};

class Header extends React.Component<PropTypes> {
  render() {
    const { classes } = this.props;

    return (
      <Toolbar classes={{ gutters: classes.gutters }}>
        <IconButton
          edge="start"
          color="inherit"
          component={Link}
          to="/"
          aria-label="Hedgehog"
        >
          <SvgIcon src={logoUrl} alt="Hedgehog Logo" />
        </IconButton>
        <Typography className={classes.brandTxt} variant="h6" noWrap>
          Hedgehog IDE
        </Typography>
      </Toolbar>
    );
  }
}

export default styled(Header);
