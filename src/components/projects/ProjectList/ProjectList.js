// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { defineMessages, useIntl, FormattedMessage as M } from 'react-intl';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import {
  LocalProjectIcon,
  CreateIcon,
  OpenIcon,
  RenameIcon,
  DeleteIcon,
  RefreshIcon,
} from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import Link from '../../misc/Link';
import { Project, ProjectError } from '../../../core/store/projects';

import s from './ProjectList.scss';

import CreateProjectDialog from './CreateProjectDialog';
import DeleteProjectDialog from './DeleteProjectDialog';
import RenameProjectDialog from './RenameProjectDialog';

const messages = defineMessages({
  projectsTitle: {
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
  exercisesTitle: {
    id: 'app.exercises.list_title',
    description: 'Title shown above the exercises list',
    defaultMessage: 'Exercises',
  },
  refreshExerciseListTooltip: {
    id: 'app.exercises.refresh_exercise_list_tooltip',
    description:
      'Tooltip and screen reader label for the refresh exercises button',
    defaultMessage: 'Refresh Exercise List',
  },
  exerciseSecondaryText: {
    id: 'app.exercises.secondary_text',
    description:
      'This text is shown below the exercise name and describes it further',
    defaultMessage: 'Difficulty: {level}',
  },
  cloneExerciseTooltip: {
    id: 'app.exercises.clone_exercise_tooltip',
    description:
      'Tooltip and screen reader label for the clone exercise button',
    defaultMessage: 'Create new project to work on exercise "{name}"',
  },
  openAssociatedProjectTooltip: {
    id: 'app.exercises.open_associated_project_tooltip',
    description:
      "Tooltip and screen reader label for the open project button. That button is shown if there's exactly one associated project.",
    defaultMessage: 'Open project "{name}" to work on exercise "{exercise}"',
  },
  openAssociatedProjectMenuTooltip: {
    id: 'app.exercises.open_associated_project_menu_tooltip',
    description:
      'Tooltip and screen reader label for the open project menu button. That button is shown if there are two or more associated projects.',
    defaultMessage: 'Open an existing project to work on exercise "{exercise}"',
  },
  openAssociatedProjectMenuItem: {
    id: 'app.exercises.open_associated_project_menu_item',
    description: 'text for the menu items in the associated projects menu.',
    defaultMessage: 'Open project "{name}"',
  },
});

type Props = {||};

function ProjectList(_props: Props) {
  const intl = useIntl();

  const createRef = hooks.useElementRef<typeof CreateProjectDialog>();
  const deleteRef = hooks.useElementRef<typeof DeleteProjectDialog>();
  const renameRef = hooks.useElementRef<typeof RenameProjectDialog>();

  const [projects, setProjects] = hooks.useAsyncState<Project[]>([]);

  function refreshProjects() {
    setProjects(Project.getProjects());
  }

  React.useEffect(() => {
    refreshProjects();
  }, []);

  function beginCreateProject() {
    // eslint-disable-next-line no-throw-literal
    if (createRef.current === null) throw 'ref is null';

    createRef.current.show();
  }

  async function confirmCreateProject(name: string): Promise<boolean> {
    try {
      await Project.createProject(name);
      refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      refreshProjects();
      return false;
    }
  }

  function beginDeleteProject(project: Project) {
    // eslint-disable-next-line no-throw-literal
    if (deleteRef.current === null) throw 'ref is null';

    deleteRef.current.show(project);
  }

  async function confirmDeleteProject(project: Project): Promise<boolean> {
    try {
      await project.delete();
      refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      refreshProjects();
      return false;
    }
  }

  function beginRenameProject(project: Project) {
    // eslint-disable-next-line no-throw-literal
    if (renameRef.current === null) throw 'ref is null';

    renameRef.current.show(project);
  }

  async function confirmRenameProject(
    project: Project,
    newName: string,
  ): Promise<boolean> {
    try {
      await project.rename(newName);
      refreshProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      refreshProjects();
      return false;
    }
  }

  useStyles(s);

  return (
    <div className={s.container}>
      <Paper className={s.root}>
        <Toolbar className={s.toolbar}>
          <Typography className={s.title} variant="h5" noWrap>
            <M {...messages.projectsTitle} />
          </Typography>
          <Tooltip
            title={intl.formatMessage(messages.createProjectTooltip)}
            placement="bottom"
          >
            <IconButton
              aria-label={intl.formatMessage(messages.createProjectTooltip)}
              onClick={beginCreateProject}
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
              onClick={refreshProjects}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <List>
          {projects.map(project => (
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
                    onClick={() => beginRenameProject(project)}
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
                    onClick={() => beginDeleteProject(project)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <CreateProjectDialog
          ref={createRef}
          onCreate={confirmCreateProject}
          allProjects={projects}
        />
        <DeleteProjectDialog ref={deleteRef} onDelete={confirmDeleteProject} />
        <RenameProjectDialog
          ref={renameRef}
          onRename={confirmRenameProject}
          allProjects={projects}
        />
      </Paper>
      <Paper className={s.root}>
        <Toolbar className={s.toolbar}>
          <Typography className={s.title} variant="h5" noWrap>
            <M {...messages.exercisesTitle} />
          </Typography>
          <Tooltip
            title={intl.formatMessage(messages.refreshExerciseListTooltip)}
            placement="bottom"
          >
            <IconButton
              edge="end"
              aria-label={intl.formatMessage(
                messages.refreshExerciseListTooltip,
              )}
              // onClick={refreshExercises}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <List>
          {[
            { name: 'Zoowärter', level: 1, projects: [] },
            {
              name: 'Zoowärter 2',
              level: 2,
              projects: [{ name: 'Zoowärter 2 Versuch' }],
            },
            {
              name: 'Zoowärter 3',
              level: 3,
              projects: [
                { name: 'Zoowärter 3 v1' },
                { name: 'Zoowärter 3 v2' },
              ],
            },
          ].map(exercise => (
            <ListItem key={exercise.name} button>
              <ListItemAvatar>
                <Avatar>
                  <LocalProjectIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={exercise.name}
                secondary={intl.formatMessage(messages.exerciseSecondaryText, {
                  ...exercise,
                })}
              />
              <ListItemSecondaryAction>
                <Tooltip
                  title={intl.formatMessage(messages.cloneExerciseTooltip, {
                    name: exercise.name,
                  })}
                  placement="bottom"
                >
                  <IconButton
                    {...(exercise.projects.length === 0 ? { edge: 'end' } : {})}
                    aria-label={intl.formatMessage(
                      messages.cloneExerciseTooltip,
                      { name: exercise.name },
                    )}
                    // onClick={() => beginCloneExercise(exercise)}
                  >
                    <CreateIcon />
                  </IconButton>
                </Tooltip>
                {exercise.projects.length === 0 ? null : exercise.projects
                    .length === 1 ? (
                  exercise.projects.map(project => (
                    <Tooltip
                      key={project.name}
                      title={intl.formatMessage(
                        messages.openAssociatedProjectTooltip,
                        { exercise: exercise.name, name: project.name },
                      )}
                      placement="bottom"
                    >
                      <IconButton
                        edge="end"
                        aria-label={intl.formatMessage(
                          messages.openAssociatedProjectTooltip,
                          { exercise: exercise.name, name: project.name },
                        )}
                        component={Link}
                        to={`/projects/${project.name}`}
                      >
                        <OpenIcon />
                      </IconButton>
                    </Tooltip>
                  ))
                ) : (
                  <PopupState
                    variant="popover"
                    popupId={`${exercise.name}-menu`}
                  >
                    {popupState => (
                      <>
                        <Tooltip
                          title={intl.formatMessage(
                            messages.openAssociatedProjectMenuTooltip,
                            { exercise: exercise.name },
                          )}
                          placement="bottom"
                        >
                          <IconButton
                            edge="end"
                            {...bindTrigger(popupState)}
                            aria-label={intl.formatMessage(
                              messages.openAssociatedProjectMenuTooltip,
                              { exercise: exercise.name },
                            )}
                          >
                            <OpenIcon />
                          </IconButton>
                        </Tooltip>
                        <Menu
                          anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'top',
                          }}
                          transformOrigin={{
                            horizontal: 'right',
                            vertical: 'top',
                          }}
                          keepMounted
                          {...bindMenu(popupState)}
                        >
                          {exercise.projects.map(project => (
                            <MenuItem
                              key={project.name}
                              component={Link}
                              to={`/projects/${project.name}`}
                            >
                              <M
                                {...messages.openAssociatedProjectMenuItem}
                                values={{ name: project.name }}
                              />
                            </MenuItem>
                          ))}
                        </Menu>
                      </>
                    )}
                  </PopupState>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
}

export default ProjectList;
