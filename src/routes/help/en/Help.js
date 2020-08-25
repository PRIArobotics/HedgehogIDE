// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../../../components/misc/Link';

import s from '../Help.scss';

import help1img1 from './1_create_project/1_open_ide.png';
import help1img2 from './1_create_project/2_click_plus.png';
import help1img3 from './1_create_project/3_create_project.png';
import help1img4 from './1_create_project/4_open_project.png';
import help2img1 from './2_create_file/1_context_menu.png';
import help2img2 from './2_create_file/2_create_file.png';
import help2img3 from './2_create_file/3_open_file.png';
import help3img1 from './3_open_simulator/1_drag_tab.png';
import help3img2 from './3_open_simulator/2_result.png';
import help4img1 from './4_blockly_example/1_example_program.png';
import help5img1 from './5_import_export/1_export.png';
import help5img2 from './5_import_export/2_import.png';

function Help() {
  return (
    <Container maxWidth="md" className={s.root}>
      <Typography component="h1" variant="h3" gutterBottom>
        Getting Started
      </Typography>
      <Typography variant="body1" paragraph>
        The Hedgehog IDE allows you to create and run your own programs easily, without installing
        extra software or creating accounts first. We respect your privacy and your data, so we
        don&apos;t require any of your data unless absolutely needed - that is, basically, the code
        you write and nothing else.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Alert severity="info">
          The Hedgehog IDE is still at the beginning. Things may be rough around the edges, and not
          all features are there yet. Future features, such as sharing code with others, will
          require you to share some more data with us. Those features will be strictly optional and
          opt-in, though.
        </Alert>
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Creating a project
      </Typography>
      <Typography variant="body1" paragraph>
        A software project contains files that work together to create a program. Creating one is
        the first thing you will have to do to get started. In your <Link to="/">project list</Link>
        , click on the &quot;+&quot; icon and choose a name. After you created the project, click on
        it to open it.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Grid container spacing={1}>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help1img1} alt="open IDE" />
          </Grid>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help1img2} alt='click "+" icon' />
          </Grid>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help1img3} alt="name and create project" />
          </Grid>
          <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help1img4} alt="open project" />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="body1" paragraph>
        After opening the project, right click the project root to create a file in it. In this
        example, let&apos;s choose &quot;New Blockly File&quot; &ndash; Blockly allows the visual
        creation of programs. After creating the file, it is opened automatically and you should see
        an empty Blockly workspace where you can create your program.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help2img1} alt="context menu" />
          </Grid>
          <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help2img2} alt="create file" />
          </Grid>
          <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help2img3} alt="open file" />
          </Grid>
        </Grid>
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Controlling a simulated robot with Blockly
      </Typography>
      <Typography variant="body1" paragraph>
        Before you start adding blocks to your program, let&apos;s look at the simulator. Click on
        the X,Y,Z axis icon above the project tree to open it in a new tab, then drag that tab to
        the bottom to see Blockly and the simulator at the same time.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Grid container spacing={1}>
          <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgLg}`}>
            <img src={help3img1} alt="moving the simulator" />
          </Grid>
          <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgLg}`}>
            <img src={help3img2} alt="Blockly and simulator side by side" />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="body1" paragraph>
        The Simulator (and the console, which is opened with the second button above the project
        tree) opens automatically when a program gives commands to the robot (or outputs text,
        respectively) if it is not already open. Nonetheless it is advisable to arrange these tabs
        in advance.
      </Typography>
      <Typography variant="body1" paragraph>
        Blockly commands are organized by categories:
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <ul>
          <li>
            <strong>Drive</strong> lets you drive the robot by starting or stopping two motors at
            the same time. Motors can use speeds between -1000 and +1000. The simulated robot&apos;s
            left wheel is motor 0, the right wheel motor 1.
          </li>
          <li>
            <strong>Motors</strong> lets you control motors individually.
          </li>
          <li>
            <strong>Servos</strong> lets you control servos. Servo positions are between 0 and 1000.
            The simulated robot does not yet have any servos, though. Stay tuned!
          </li>
          <li>
            <strong>Sensors</strong> lets you observe the simulated environment. Sensor values are
            between 0 and 4095, the exact value ranges depend on the type of sensor though. The
            simulated robot has eight sensors at its front:
            <ul>
              <li>
                Four line sensors that can detect black lines on the ground; these are sensors 0 to
                3, from left to right. These sensors change color to orange when a line is detected.
                <br />
                <strong>Values:</strong> The sensor value is high when a (dark) line is detected,
                otherwise (on light surfaces) it is low.
              </li>
              <li>
                Three distance sensors looking forward and slightly to the sides can detect
                obstacles without touching them; these are sensors 4 to 6, from left to right. The
                rays coming out of the robot's front indicate the direction and range of these
                sensors.
                <br />
                <strong>Values:</strong> The sensor value increases when getting closer to an
                obstacle, then decreases again when the obstacle almost touches the robot. This
                behavior models a distance sensor very popular in hobby robotics.
              </li>
              <li>
                One bump sensor that is almost as wide as the robot front; this is sensor 8. This
                sensor changes color to orange when a line is detected.
                <br />
                <strong>Values:</strong> The sensor value is low when a collision is detected. This
                behavior models a &quot;pull-up&quot; circuit that is often used for touch sensors.
              </li>
            </ul>
            Sensors come in two varieties, analog and digital:
            <ul>
              <li>
                <strong>Analog</strong> sensors can take on many different values; a good example is
                the distance sensor. To use an analog sensor, you have to work with the numeric
                values between 0 and 4095.
              </li>
              <li>
                <strong>Digital</strong> sensors only have two possible states, e.g.
                &quot;collision&quot; and &quot;no collision&quot; or &quot;line&quot; or &quot;no
                line&quot;. For these sensors, you can simplify your work by using digital values:
                <ul>
                  <li>
                    Analog values 0 bis 2047: Digital value <code>false</code>
                  </li>
                  <li>
                    Analog values 2048 bis 4095: Digital value <code>true</code>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            The other categories contain general programming constructs, such as conditionals and
            loops.
          </li>
        </ul>
      </Typography>
      <Typography variant="body1" paragraph>
        Now let&apos;s try out a simple program:
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Grid container spacing={1}>
          <Grid item xs={12} className={`${s.gridImg} ${s.gridImgLg}`}>
            <img src={help4img1} alt="example program" />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="body1" paragraph>
        Create this program in your project, then click the green &quot;Play&quot; button; you will
        see the robot driving to the other side of the simulation and stopping at the wall. In
        detail, what happened is the following:
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <ul>
          <li>The first block let the robot move forward.</li>
          <li>
            The next block is a loop, running while the sensor on port 8 has a high digital value.
            Sensor 8 is the bump sensor, and high values mean no collison. In other words, the loop
            repeats until a collision is detected.
          </li>
          <li>
            Inside the loop, the program simply sleeps. Even though the program pauses, the motors
            are still moving. That means that the robot will continue moving as long as there was no
            collision.
          </li>
          <li>
            After the loop, i.e. as soon as there was a collision, the robot is stopped. This is the
            last command, so the program is finished.
          </li>
        </ul>
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Exporting & importing files
      </Typography>
      <Typography variant="body1" paragraph>
        To download one of your files so that you can, for example, share it with others, right
        click on that file and choose &quot;Download&quot;. Likewise, to import a file into the
        Hedgehog IDE, right click on a folder and choose &quot;Upload&quot;. Beware, currently the
        Hedgehog IDE replaces existing files without warning!
      </Typography>
      <Typography variant="body1" paragraph>
        Despite the name of these operations, your files are stored locally in your browser, not on
        our servers. Future features may allow that, but you will always be asked if you want to
        share data with us.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Alert severity="info">
          Up- and downloading whole folders is not possible at the moment, sorry!
        </Alert>
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Grid container spacing={1}>
          <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help5img1} alt="download a file" />
          </Grid>
          <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgSm}`}>
            <img src={help5img2} alt="upload a file" />
          </Grid>
        </Grid>
      </Typography>
    </Container>
  );
}

export default withStyles(s)(Help);
