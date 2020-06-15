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

import gql from 'graphql-tag';

import {
  LocalProjectIcon,
  UploadExerciseIcon,
  CreateIcon,
  OpenIcon,
  RenameIcon,
  DeleteIcon,
  RefreshIcon,
} from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import Link from '../../misc/Link';
import SimpleDialog from '../../misc/SimpleDialog';
import { Project, ProjectError } from '../../../core/store/projects';

import s from './ProjectList.scss';

import useCreateProjectDialog from './useCreateProjectDialog';
import useDeleteProjectDialog from './useDeleteProjectDialog';
import useRenameProjectDialog from './useRenameProjectDialog';
import useProjectIndex from './useProjectIndex';
import useLocalProjects from './useLocalProjects';
import useRemoteProjects from './useRemoteProjects';

import {
  type CreateProject,
  type CreateProjectVariables,
} from './__generated__/CreateProject';

import { useAuth } from '../../users/AuthProvider';

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
  uploadExerciseTooltip: {
    id: 'app.exercises.upload_exercise_tooltip',
    description:
      'Tooltip and screen reader label for the upload exercise button',
    defaultMessage: 'Upload project "{name}" as an exercise',
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

const useCreateProjectMutation = hooks.makeMutation<
  CreateProject,
  CreateProjectVariables,
>(gql`
  mutation CreateProject($project: ProjectInput!) {
    createProject(project: $project)
  }
`);

type Props = {||};

function ProjectList(_props: Props) {
  const auth = useAuth();
  const intl = useIntl();

  const [localProjects, refreshLocalProjects] = useLocalProjects();
  const [remoteProjects, refreshRemoteProjects] = useRemoteProjects();

  const [
    createProjectMutation,
    _createProjectResponse,
  ] = useCreateProjectMutation();

  const [projectIndex, setRemoteProjects] = useProjectIndex(localProjects);

  async function confirmCreateProject(name: string): Promise<boolean> {
    try {
      await Project.createProject(name);
      refreshLocalProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      refreshLocalProjects();
      return false;
    }
  }

  const createProject = useCreateProjectDialog(
    confirmCreateProject,
    localProjects,
  );

  async function confirmDeleteProject(project: Project): Promise<boolean> {
    try {
      await project.delete();
      refreshLocalProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      refreshLocalProjects();
      return false;
    }
  }

  const deleteProject = useDeleteProjectDialog(confirmDeleteProject);

  async function confirmRenameProject(
    project: Project,
    newName: string,
  ): Promise<boolean> {
    try {
      await project.rename(newName);
      refreshLocalProjects();
      return true;
    } catch (ex) {
      if (!(ex instanceof ProjectError)) throw ex;
      refreshLocalProjects();
      return false;
    }
  }

  const renameProject = useRenameProjectDialog(
    confirmRenameProject,
    localProjects,
  );

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
              onClick={createProject.show}
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
              onClick={refreshLocalProjects}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <List>
          {localProjects.map(project => (
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
                {auth.authData ? (
                  <Tooltip
                    title={intl.formatMessage(messages.uploadExerciseTooltip, {
                      name: project.name,
                    })}
                    placement="bottom"
                  >
                    <IconButton
                      aria-label={intl.formatMessage(
                        messages.uploadExerciseTooltip,
                        { name: project.name },
                      )}
                      onClick={() => renameProject.show(project)}
                    >
                      <UploadExerciseIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
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
                    onClick={() => renameProject.show(project)}
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
                    onClick={() => deleteProject.show(project)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <SimpleDialog
          id="create-dialog"
          {...createProject.mountSimpleDialog()}
        />
        <SimpleDialog
          id="delete-dialog"
          {...deleteProject.mountSimpleDialog()}
        />
        <SimpleDialog
          id="rename-dialog"
          {...renameProject.mountSimpleDialog()}
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
              onClick={refreshRemoteProjects}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <List>
          {remoteProjects.map(exercise => {
            const associatedProjects =
              projectIndex.localProjects[exercise.id] ?? [];

            return (
              <ListItem key={exercise.name} button>
                <ListItemAvatar>
                  <Avatar>
                    <LocalProjectIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={exercise.name}
                  // secondary={intl.formatMessage(
                  //   messages.exerciseSecondaryText,
                  //   {
                  //     ...exercise,
                  //   },
                  // )}
                />
                <ListItemSecondaryAction>
                  <Tooltip
                    title={intl.formatMessage(messages.cloneExerciseTooltip, {
                      name: exercise.name,
                    })}
                    placement="bottom"
                  >
                    <IconButton
                      {...(associatedProjects.length === 0
                        ? { edge: 'end' }
                        : {})}
                      aria-label={intl.formatMessage(
                        messages.cloneExerciseTooltip,
                        { name: exercise.name },
                      )}
                      // onClick={() => beginCloneExercise(exercise)}
                    >
                      <CreateIcon />
                    </IconButton>
                  </Tooltip>
                  {associatedProjects.length ===
                  0 ? null : associatedProjects.length === 1 ? (
                    associatedProjects.map(project => (
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
                            {associatedProjects.map(project => (
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
            );
          })}
        </List>
      </Paper>
    </div>
  );
}

export default ProjectList;
