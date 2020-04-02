// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import Link from '../../misc/Link';

import s from './Footer.scss';

const messages = defineMessages({
  home: {
    id: 'app.footer.home',
    description: 'Link to the home page',
    defaultMessage: 'Home',
  },
});

function Footer() {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <span className={s.text}>© PRIA</span>
        <span className={s.spacer}>·</span>
        <Link className={s.link} to="/">
          <M {...messages.home} />
        </Link>
        {__DEV__ ? (
          <>
            <span className={s.spacer}>·</span>
            <Link className={s.link} to="/privacy">
              Privacy
            </Link>
            <span className={s.spacer}>·</span>
            <Link className={s.link} to="/admin">
              Admin
            </Link>
            <span className={s.spacer}>·</span>
            <Link className={s.link} to="/not-found">
              Not Found
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default withStyles(s)(Footer);
