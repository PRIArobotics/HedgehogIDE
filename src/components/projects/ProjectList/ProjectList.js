// @flow

import React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';

import Link from '../../misc/Link';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProjectList.scss';

import * as ProjectsDB from '../../../core/store/projects';

type PropTypes = {||};
type StateTypes = {|
  projects: Array<ProjectsDB.Project>,
|};

class Console extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    projects: [],
  };

  componentDidMount() {
    (async () => {
      const projects = await ProjectsDB.getProjects();
      this.setState({ projects });
    })();
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>Your projects</h1>
          <List>{this.state.projects.map(project => (
            <ListItem
              key={project.id}
              button
              component={Link}
              to={`/projects/${project.name}`}
            >
              <ListItemAvatar>
                <Avatar>
                  <FolderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={project.name}
                // secondary="Secondary text"
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}</List>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Console);
