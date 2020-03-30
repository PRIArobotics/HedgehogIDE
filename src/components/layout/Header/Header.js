// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/styles';

import Link from '../../misc/Link';
import { SelectLanguageIcon } from '../../misc/palette';

import logoUrl from './logo.svg';

const styled = withStyles(theme => ({
  gutters: {
    paddingLeft: theme.spacing(2),
  },
  brandTxt: {
    marginLeft: '10px',
    flexGrow: 1,
  },
}));

type HeaderProps = {|
  classes: Object,
|};

function Header({ classes }: HeaderProps) {
  const [selectLanguageMenuAnchorEl, setSelectLanguageMenuAnchorEl] = React.useState(null);

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
      <Tooltip title="Select Language">
        <IconButton
          edge="end"
          color="inherit"
          aria-controls="select-language-menu"
          aria-haspopup="true"
          onClick={event => setSelectLanguageMenuAnchorEl(event.currentTarget)}
        >
          <SelectLanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="select-language-menu"
        anchorEl={selectLanguageMenuAnchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        keepMounted
        open={!!selectLanguageMenuAnchorEl}
        onClose={() => setSelectLanguageMenuAnchorEl(null)}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => setSelectLanguageMenuAnchorEl(null)}
        >
          English
        </Button>
      </Menu>
    </Toolbar>
  );
}

export default styled(Header);
