// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../../components/misc/Link';

import s from './Help.scss';

function Help() {
  return (
    <Container maxWidth="md" className={s.root}>
      <Typography component="h1" variant="h3" gutterBottom>
        Getting Started
      </Typography>
      <Typography variant="body1" paragraph>
        The Hedgehog IDE is allows you to create and run your own programs
        easily, without installing extra software or creating accounts first. We
        respect your privacy and your data, so we don&apos;t require any of your
        data unless absolutely needed - that is, basically, the code you write
        and nothing else.
      </Typography>
      <Typography variant="body1" paragraph>
        <Alert severity="info">
          The Hedgehog IDE is still at the beginning. Things may be rough around
          the edges, and not all features are there yet. Future features, such
          as sharing code with others, will require you to share some more data
          with us. Those features will be strictly optional and opt-in, though.
        </Alert>
      </Typography>
      <Typography component="h2" variant="h4" gutterTop gutterBottom>
        Creating a project
      </Typography>
      <Typography variant="body1" paragraph>
        A software project contains files that work together to create a
        program. Creating one is the first thing you will have to do to get
        started. In your <Link to="/projects">project list</Link>, click on the
        &quot;+&quot; icon and choose a name. After you created the project,
        click on it to open it.
      </Typography>
      <Typography variant="body1" paragraph>
        <Grid container spacing={1}>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src="/help/1_create_project/1_open_ide.png" alt="open IDE" />
          </Grid>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img
              src="/help/1_create_project/2_click_plus.png"
              alt='click "+" icon'
            />
          </Grid>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img
              src="/help/1_create_project/3_create_project.png"
              alt="name and create project"
            />
          </Grid>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img
              src="/help/1_create_project/4_open_project.png"
              alt="open project"
            />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="body1" paragraph>
        After opening the project, right click the project root to create a file
        in it. In this example, let&apos;s choose &quot;New Blockly File&quot;
        &ndash; Blockly allows the visual creation of programs. After naming the
        file, make sure it&apos;s shown in the project tree, and open it by
        double-clicking. You will see a Blockly workspace where you can create
        your program.
      </Typography>
      <Typography variant="body1" paragraph>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img
              src="/help/2_create_file/1_context_menu.png"
              alt="context menu"
            />
          </Grid>
          <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img
              src="/help/2_create_file/2_create_file.png"
              alt="create file"
            />
          </Grid>
          <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src="/help/2_create_file/3_open_file.png" alt="open file" />
          </Grid>
        </Grid>
      </Typography>
      <Typography component="h2" variant="h4" gutterTop gutterBottom>
        Controlling a simulated robot with Blockly
      </Typography>
      <Typography variant="body1" paragraph>
        Before you start adding blocks to your program, let&apos;s look at the
        simulator. Click on the X,Y,Z axis icon above the project tree to open
        it in a new tab, then drag that tab to the side to see Blockly and the
        simulator at the same time.
      </Typography>
      <Typography variant="body1" paragraph>
        <Grid container spacing={1}>
          <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgLg}`}>
            <img
              src="/help/3_open_simulator/1_drag_tab.png"
              alt="context menu"
            />
          </Grid>
          <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgLg}`}>
            <img src="/help/3_open_simulator/2_result.png" alt="create file" />
          </Grid>
        </Grid>
      </Typography>
    </Container>
  );
}

export default withStyles(s)(Help);
