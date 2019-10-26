// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import RefreshIcon from '@material-ui/icons/Refresh';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Link from '../../misc/Link';
import * as ProjectsDB from '../../../core/store/projects';

import s from './ProjectList.scss';

import DeleteProjectDialog from './DeleteProjectDialog';

type PropTypes = {||};
type StateTypes = {|
  projects: Array<ProjectsDB.Project>,
  creatingProject: boolean,
  newProjectName: string,
|};

class ProjectList extends React.Component<PropTypes, StateTypes> {
  deleteRef: RefObject<typeof DeleteProjectDialog> = React.createRef();

  state: StateTypes = {
    projects: [],
    creatingProject: false,
    newProjectName: '',
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

  beginCreateProject() {
    this.setState({ creatingProject: true });
  }

  setNewProjectName(name: string) {
    this.setState({ newProjectName: name.replace(/[^-\w#$%().,:; ]/g, '') });
  }

  isValidProjectName() {
    const { projects, newProjectName } = this.state;
    return (
      newProjectName !== '' &&
      projects.every(project => project.name !== newProjectName)
    );
  }

  cancelCreateProject() {
    this.setState({ creatingProject: false });
  }

  async confirmCreateProject() {
    try {
      await ProjectsDB.createProject({ name: this.state.newProjectName });
      await this.refreshProjects();
      this.setState({
        creatingProject: false,
        newProjectName: '',
      });
    } catch (ex) {
      if (!(ex instanceof ProjectsDB.ProjectError)) throw ex;
      await this.refreshProjects();
    }
  }

  beginDeleteProject(project: ProjectsDB.Project) {
    // eslint-disable-next-line no-throw-literal
    if (this.deleteRef.current === null) throw 'ref is null';

    this.deleteRef.current.show(project);
  }

  async confirmDeleteProject(project: ProjectsDB.Project) {
    try {
      await ProjectsDB.removeProject(project);
    } catch (ex) {
      if (!(ex instanceof ProjectsDB.ProjectError)) throw ex;
    }
    await this.refreshProjects();
  }

  render() {
    return (
      <div className={s.container}>
        <Paper className={s.root}>
          <Toolbar className={s.toolbar}>
            <Typography className={s.title} variant="h5" noWrap>
              Your projects
            </Typography>
            <IconButton
              aria-label="create project"
              onClick={() => this.beginCreateProject()}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="refresh project list"
              onClick={() => this.refreshProjects()}
            >
              <RefreshIcon />
            </IconButton>
          </Toolbar>
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
                    aria-label={`delete project "${project.name}"`}
                    onClick={() => this.beginDeleteProject(project)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Dialog
            open={this.state.creatingProject}
            onClose={() => this.cancelCreateProject()}
            aria-labelledby="create-dialog-title"
            aria-describedby="create-dialog-description"
          >
            <DialogTitle id="create-dialog-title">
              Create new project
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="create-dialog-description">
                Please enter the new project&apos;s name.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Project Name"
                type="text"
                value={this.state.newProjectName}
                onChange={event => this.setNewProjectName(event.target.value)}
                error={!this.isValidProjectName()}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.cancelCreateProject()}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => this.confirmCreateProject()}
                color="primary"
                disabled={!this.isValidProjectName()}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
          <DeleteProjectDialog
            ref={this.deleteRef}
            onDelete={project => this.confirmDeleteProject(project)}
          />
        </Paper>
      </div>
    );
  }
}

export default withStyles(s)(ProjectList);
