// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../../components/misc/Link';

import s from './Home.css';

const Home = props => (
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
    <Grid container spacing={2} justify="center">
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/projects"
        >
          Create your first project
        </Button>
      </Grid>
    </Grid>
  </Container>
);

export default withStyles(s)(Home);
