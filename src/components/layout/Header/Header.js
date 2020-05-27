// @flow

import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { defineMessages, useIntl, FormattedMessage as M } from 'react-intl';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { useLocale } from '../../locale';
import Link from '../../misc/Link';
import {
  SelectLanguageIcon,
  AccountCircleIcon,
  ExitToAppIcon,
} from '../../misc/palette';
import commonMessages from '../../misc/commonMessages';

import logoUrl from './logo.svg';
import Login from '../../users/Login';
import { useAuth } from '../../users/AuthProvider';

const messages = {
  ...defineMessages({
    homeLabel: {
      id: 'app.header.home_label',
      description: 'Home button label for screenreaders',
      defaultMessage: 'Home',
    },
    homeLogoAlt: {
      id: 'app.header.home_logo_alt',
      description: "alt-text for the home button's icon",
      defaultMessage: 'Hedgehog Logo',
    },
    title: {
      id: 'app.header.title',
      description: 'Main Hedgehog IDE title',
      defaultMessage: 'Hedgehog IDE',
    },
    selectLanguageTooltip: {
      id: 'app.header.select_language_tooltip',
      description: 'Tooltip for the language selection menu button',
      defaultMessage: 'Select Language',
    },
    myAccount: {
      id: 'app.header.my_account_tooltip',
      description: 'Tooltip for the account toggle menu button',
      defaultMessage: 'My Account',
    },
  }),
  ...commonMessages,
};

const useStyles = makeStyles(theme => ({
  gutters: {
    paddingLeft: theme.spacing(2),
  },
  brandTxt: {
    marginLeft: '10px',
    flexGrow: 1,
  },
}));

function Header() {
  const classes = useStyles();
  const auth = useAuth();
  const intl = useIntl();
  const { setPreferredLocale } = useLocale();

  const [loginOpen, setLoginOpen] = React.useState(false);

  React.useEffect(() => auth.recoverSession(), []);

  return (
    <Toolbar classes={{ gutters: classes.gutters }}>
      <IconButton
        edge="start"
        color="inherit"
        component={Link}
        to="/"
        aria-label={intl.formatMessage(messages.homeLabel)}
      >
        <Icon>
          <img src={logoUrl} alt={intl.formatMessage(messages.homeLogoAlt)} />
        </Icon>
      </IconButton>
      <Typography className={classes.brandTxt} variant="h6" noWrap>
        <M {...messages.title} />
      </Typography>
      <PopupState variant="popover" popupId="select-language-menu">
        {popupState => (
          <>
            <Tooltip title={<M {...messages.selectLanguageTooltip} />}>
              <IconButton color="inherit" {...bindTrigger(popupState)}>
                <SelectLanguageIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              keepMounted
              {...bindMenu(popupState)}
            >
              <MenuItem
                onClick={() => {
                  setPreferredLocale('de');
                  popupState.close();
                }}
              >
                Deutsch
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setPreferredLocale('en');
                  popupState.close();
                }}
              >
                English
              </MenuItem>
            </Menu>
          </>
        )}
      </PopupState>
      {auth.authData && auth.authData.username ? (
        <PopupState variant="popover" popupId="select-language-menu">
          {popupState => (
            <>
              <Tooltip title={<M {...messages.myAccount} />}>
                <IconButton color="inherit" {...bindTrigger(popupState)}>
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                keepMounted
                {...bindMenu(popupState)}
              >
                <MenuItem onClick={auth.logout}>
                  <M {...messages.logout} />
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>
      ) : (
        <Tooltip title={<M {...messages.login} />}>
          <IconButton color="inherit" onClick={() => setLoginOpen(true)}>
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      )}

      <Login
        open={loginOpen}
        onSuccess={() => setLoginOpen(false)}
        onError={() => setLoginOpen(false)}
      />
    </Toolbar>
  );
}

export default Header;
