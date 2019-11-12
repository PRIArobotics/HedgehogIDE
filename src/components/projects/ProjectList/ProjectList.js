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
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FolderIcon from '@material-ui/icons/Folder';
import RefreshIcon from '@material-ui/icons/Refresh';

import Link from '../../misc/Link';
import * as ProjectsDB from '../../../core/store/projects';

import s from './ProjectList.scss';

import CreateProjectDialog from './CreateProjectDialog';
import DeleteProjectDialog from './DeleteProjectDialog';
import RenameProjectDialog from './RenameProjectDialog';

type PropTypes = {||};
type StateTypes = {|
  projects: Array<ProjectsDB.Project>,
|};

class ProjectList extends React.Component<PropTypes, StateTypes> {
  createRef: RefObject<typeof CreateProjectDialog> = React.createRef();
  deleteRef: RefObject<typeof DeleteProjectDialog> = React.createRef();
  renameRef: RefObject<typeof RenameProjectDialog> = React.createRef();

  state: StateTypes = {
    projects: [],
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
    // eslint-disable-next-line no-throw-literal
    if (this.createRef.current === null) throw 'ref is null';

    this.createRef.current.show();
  }

  async confirmCreateProject(name: string): Promise<boolean> {
    try {
      await ProjectsDB.createProject(name);
      await this.refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectsDB.ProjectError)) throw ex;
      await this.refreshProjects();
      return false;
    }
  }

  beginDeleteProject(project: ProjectsDB.Project) {
    // eslint-disable-next-line no-throw-literal
    if (this.deleteRef.current === null) throw 'ref is null';

    this.deleteRef.current.show(project);
  }

  async confirmDeleteProject(project: ProjectsDB.Project): Promise<boolean> {
    try {
      await ProjectsDB.removeProject(project);
      await this.refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectsDB.ProjectError)) throw ex;
      await this.refreshProjects();
      return false;
    }
  }

  beginRenameProject(project: ProjectsDB.Project) {
    // eslint-disable-next-line no-throw-literal
    if (this.renameRef.current === null) throw 'ref is null';

    this.renameRef.current.show(project);
  }

  async confirmRenameProject(
    project: ProjectsDB.Project,
    name: string,
  ): Promise<boolean> {
    try {
      await ProjectsDB.renameProject(project, name);
      await this.refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectsDB.ProjectError)) throw ex;
      await this.refreshProjects();
      return false;
    }
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
                key={project}
                button
                component={Link}
                to={`/projects/${project}`}
              >
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={project}
                  // secondary="Secondary text"
                />
                <ListItemSecondaryAction>
                  <IconButton
                    aria-label={`delete project "${project}"`}
                    onClick={() => this.beginRenameProject(project)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label={`delete project "${project}"`}
                    onClick={() => this.beginDeleteProject(project)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <CreateProjectDialog
            ref={this.createRef}
            onCreate={name => this.confirmCreateProject(name)}
            allProjects={this.state.projects}
          />
          <DeleteProjectDialog
            ref={this.deleteRef}
            onDelete={project => this.confirmDeleteProject(project)}
          />
          <RenameProjectDialog
            ref={this.renameRef}
            onRename={(project, name) =>
              this.confirmRenameProject(project, name)
            }
            allProjects={this.state.projects}
          />
        </Paper>
      </div>
    );
  }
}

export default withStyles(s)(ProjectList);
