// @flow

import * as React from 'react';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/styles';

import Link from '../../misc/Link';

import logoUrl from './logo.svg';

const styled = withStyles(theme => ({
  gutters: {
    paddingLeft: theme.spacing(2),
  },
  brandTxt: {
    marginLeft: '10px',
  },
}));

type HeaderProps = {|
  classes: Object,
|};

function Header({ classes }: HeaderProps) {
  return (
    <Toolbar classes={{ gutters: classes.gutters }}>
      <IconButton
        edge="start"
        color="inherit"
        component={Link}
        to="/"
        aria-label="Hedgehog"
      >
        <Icon>
          <img src={logoUrl} alt="Hedgehog Logo" />
        </Icon>
      </IconButton>
      <Typography className={classes.brandTxt} variant="h6" noWrap>
        Hedgehog IDE
      </Typography>
    </Toolbar>
  );
}

export default styled(Header);
