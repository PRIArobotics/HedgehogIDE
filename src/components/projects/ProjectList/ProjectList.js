// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import {
  defineMessages,
  injectIntl,
  IntlShape,
  FormattedMessage as M,
} from 'react-intl';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import {
  LocalProjectIcon,
  CreateIcon,
  RenameIcon,
  DeleteIcon,
  RefreshIcon,
} from '../../misc/palette';

import Link from '../../misc/Link';
import { Project, ProjectError } from '../../../core/store/projects';

import s from './ProjectList.scss';

import CreateProjectDialog from './CreateProjectDialog';
import DeleteProjectDialog from './DeleteProjectDialog';
import RenameProjectDialog from './RenameProjectDialog';

const messages = defineMessages({
  title: {
    id: 'app.projects.list_title',
    description: 'Title shown above the project list',
    defaultMessage: 'Your Projects',
  },
  createProjectTooltip: {
    id: 'app.projects.create_project_tooltip',
    description:
      'Tooltip and screen reader label for the create project button',
    defaultMessage: 'Create Project',
  },
  refreshProjectListTooltip: {
    id: 'app.projects.refresh_project_list_tooltip',
    description:
      'Tooltip and screen reader label for the refresh projects button',
    defaultMessage: 'Refresh Project List',
  },
  renameProjectTooltip: {
    id: 'app.projects.rename_project_tooltip',
    description:
      'Tooltip and screen reader label for the rename project button',
    defaultMessage: 'Rename Project "{name}"',
  },
  deleteProjectTooltip: {
    id: 'app.projects.delete_project_tooltip',
    description:
      'Tooltip and screen reader label for the delete project button',
    defaultMessage: 'Delete Project "{name}"',
  },
});

type PropTypes = {|
  intl: IntlShape,
|};
type StateTypes = {|
  projects: Project[],
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
    const projects = await Project.getProjects();
    this.setState({ projects });
  }

  beginCreateProject() {
    // eslint-disable-next-line no-throw-literal
    if (this.createRef.current === null) throw 'ref is null';

    this.createRef.current.show();
  }

  async confirmCreateProject(name: string): Promise<boolean> {
    try {
      await Project.createProject(name);
      await this.refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      await this.refreshProjects();
      return false;
    }
  }

  beginDeleteProject(project: Project) {
    // eslint-disable-next-line no-throw-literal
    if (this.deleteRef.current === null) throw 'ref is null';

    this.deleteRef.current.show(project);
  }

  async confirmDeleteProject(project: Project): Promise<boolean> {
    try {
      await project.delete();
      await this.refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      await this.refreshProjects();
      return false;
    }
  }

  beginRenameProject(project: Project) {
    // eslint-disable-next-line no-throw-literal
    if (this.renameRef.current === null) throw 'ref is null';

    this.renameRef.current.show(project);
  }

  async confirmRenameProject(
    project: Project,
    newName: string,
  ): Promise<boolean> {
    try {
      await project.rename(newName);
      await this.refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      await this.refreshProjects();
      return false;
    }
  }

  render() {
    const { intl } = this.props;

    return (
      <div className={s.container}>
        <Paper className={s.root}>
          <Toolbar className={s.toolbar}>
            <Typography className={s.title} variant="h5" noWrap>
              <M {...messages.title} />
            </Typography>
            <Tooltip
              title={intl.formatMessage(messages.createProjectTooltip)}
              placement="bottom"
            >
              <IconButton
                aria-label={intl.formatMessage(messages.createProjectTooltip)}
                onClick={() => this.beginCreateProject()}
              >
                <CreateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={intl.formatMessage(messages.refreshProjectListTooltip)}
              placement="bottom"
            >
              <IconButton
                edge="end"
                aria-label={intl.formatMessage(
                  messages.refreshProjectListTooltip,
                )}
                onClick={() => this.refreshProjects()}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
          <List>
            {this.state.projects.map(project => (
              <ListItem
                key={project.name}
                button
                component={Link}
                to={`/projects/${project.name}`}
              >
                <ListItemAvatar>
                  <Avatar>
                    <LocalProjectIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={project.name} />
                <ListItemSecondaryAction>
                  <Tooltip
                    title={intl.formatMessage(messages.renameProjectTooltip, {
                      name: project.name,
                    })}
                    placement="bottom"
                  >
                    <IconButton
                      aria-label={intl.formatMessage(
                        messages.renameProjectTooltip,
                        { name: project.name },
                      )}
                      onClick={() => this.beginRenameProject(project)}
                    >
                      <RenameIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={intl.formatMessage(messages.deleteProjectTooltip, {
                      name: project.name,
                    })}
                    placement="bottom"
                  >
                    <IconButton
                      edge="end"
                      aria-label={intl.formatMessage(
                        messages.deleteProjectTooltip,
                        { name: project.name },
                      )}
                      onClick={() => this.beginDeleteProject(project)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <CreateProjectDialog
            ref={this.createRef}
            onCreate={project => this.confirmCreateProject(project)}
            allProjects={this.state.projects}
          />
          <DeleteProjectDialog
            ref={this.deleteRef}
            onDelete={project => this.confirmDeleteProject(project)}
          />
          <RenameProjectDialog
            ref={this.renameRef}
            onRename={(project, newName) =>
              this.confirmRenameProject(project, newName)
            }
            allProjects={this.state.projects}
          />
        </Paper>
      </div>
    );
  }
}

export default withStyles(s)(injectIntl(ProjectList));
