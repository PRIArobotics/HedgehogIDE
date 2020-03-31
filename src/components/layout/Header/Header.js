// @flow

import * as React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/styles';

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import Link from '../../misc/Link';
import { SelectLanguageIcon } from '../../misc/palette';

import logoUrl from './logo.svg';

const messages = defineMessages({
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
});

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
  const intl = useIntl();

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
        <FormattedMessage {...messages.title} />
      </Typography>
      <PopupState variant="popover" popupId="select-language-menu">
        {popupState => (
          <>
            <Tooltip
              title={<FormattedMessage {...messages.selectLanguageTooltip} />}
            >
              <IconButton
                edge="end"
                color="inherit"
                {...bindTrigger(popupState)}
              >
                <SelectLanguageIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              keepMounted
              {...bindMenu(popupState)}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={popupState.close}
              >
                English
              </Button>
            </Menu>
          </>
        )}
      </PopupState>
    </Toolbar>
  );
}

export default styled(Header);
