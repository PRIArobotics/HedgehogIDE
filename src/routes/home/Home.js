// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import Link from '../../components/misc/Link';

import s from './Home.css';

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
        Welcome to Hedgehog IDE
      </Typography>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        Learn coding using the Hedgehog IDE without signing up!
      </Typography>
      <Typography variant="body1" align="center" paragraph>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/projects"
        >
          Create your first project
        </Button>
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="textSecondary"
        paragraph
      >
        <Link to="/help">Or learn how to get started</Link>
      </Typography>
    </Container>
  );
}

export default withStyles(s)(Home);
