// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import Link from '../../components/misc/Link';

import s from './Home.css';

const messages = defineMessages({
  welcome: {
    id: 'app.home.welcome',
    description: 'Main header of the home page',
    defaultMessage: 'Welcome to Hedgehog IDE',
  },
  description: {
    id: 'app.home.description',
    description: 'sub header of the home page',
    defaultMessage: 'Learn coding using the Hedgehog IDE without signing up!',
  },
  create: {
    id: 'app.home.create',
    description: 'button leading to the IDE main page',
    defaultMessage: 'Create your first project',
  },
  learn: {
    id: 'app.home.learn',
    description: 'link to the help page',
    defaultMessage: 'Or learn how to get started',
  },
});

function Home() {
  return (
    <Container maxWidth="sm" className={s.root}>
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        <M {...messages.welcome} />
      </Typography>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        <M {...messages.description} />
      </Typography>
      <Typography variant="body1" align="center" paragraph>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/projects"
        >
          <M {...messages.create} />
        </Button>
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="textSecondary"
        paragraph
      >
        <M {...messages.learn} />
      </Typography>
    </Container>
  );
}

export default withStyles(s)(Home);
