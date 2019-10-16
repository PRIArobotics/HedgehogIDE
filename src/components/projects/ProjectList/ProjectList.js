// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Link from '../../misc/Link';

import s from './ProjectList.scss';

import * as ProjectsDB from '../../../core/store/projects';

type PropTypes = {||};
type StateTypes = {|
  projects: Array<ProjectsDB.Project>,
  projectToDelete: ProjectsDB.Project | null,
|};

class Console extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = {
    projects: [],
    projectToDelete: null,
  };

  componentDidMount() {
    (async () => {
      await this.refreshProjects();
    })();
  }

  async refreshProjects() {
    const projects = await ProjectsDB.getProjects();
    this.setState({ projects });
  }

  beginDeleteProject(project: ProjectsDB.Project) {
    this.setState({ projectToDelete: project });
  }

  cancelDeleteProject() {
    this.setState({ projectToDelete: null });
  }

  async confirmDeleteProject() {
    await ProjectsDB.removeProject(this.state.projectToDelete);
    await this.refreshProjects();
    this.setState({ projectToDelete: null });
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>Your projects</h1>
          <List>
            {this.state.projects.map(project => (
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
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => this.beginDeleteProject(project)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Dialog
            open={this.state.projectToDelete !== null}
            onClose={() => this.cancelDeleteProject()}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">Confirm deletion</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                Are you sure yo want to delete project &quot;
                {(this.state.projectToDelete || {}).name}&quot;?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.cancelDeleteProject()}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => this.confirmDeleteProject()}
                color="primary"
                autoFocus
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Console);
