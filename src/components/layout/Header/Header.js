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

import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

import { useLocale } from '../../locale';
import Link from '../../misc/Link';
import { SelectLanguageIcon, AccountCircleIcon, ExitToAppIcon } from '../../misc/palette';
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

const useStyles = makeStyles((theme) => ({
  gutters: {
    paddingLeft: theme.spacing(2),
  },
  brandTxt: {
    marginLeft: '10px',
    flexGrow: 1,
  },
}));

/**
 * The Header component displays the home button along with a language chooser and login/logout UI.
 */
function Header() {
  const classes = useStyles();
  const auth = useAuth();
  const intl = useIntl();
  const { setPreferredLocale } = useLocale();

  const [loginOpen, setLoginOpen] = React.useState(false);

  const selectLanguagePopupState = usePopupState({
    variant: 'popover',
    popupId: 'select-language-menu',
  });
  const authPopupState = usePopupState({
    variant: 'popover',
    popupId: 'auth-menu',
  });

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
      <Tooltip title={<M {...messages.selectLanguageTooltip} />}>
        <IconButton color="inherit" {...bindTrigger(selectLanguagePopupState)}>
          <SelectLanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        keepMounted
        {...bindMenu(selectLanguagePopupState)}
      >
        <MenuItem
          onClick={() => {
            setPreferredLocale('de');
            selectLanguagePopupState.close();
          }}
        >
          Deutsch
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPreferredLocale('en');
            selectLanguagePopupState.close();
          }}
        >
          English
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPreferredLocale('sk');
            selectLanguagePopupState.close();
          }}
        >
          Slovák
        </MenuItem>
      </Menu>
      {auth.authData ? (
        <>
          <Tooltip title={<M {...messages.myAccount} />}>
            <IconButton color="inherit" {...bindTrigger(authPopupState)}>
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            keepMounted
            {...bindMenu(authPopupState)}
          >
            <MenuItem onClick={auth.logout}>
              <M {...messages.logout} />
            </MenuItem>
          </Menu>
        </>
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
