// @flow

import gql from 'graphql-tag';

import * as hooks from '../../misc/hooks';

import { type DeleteProject, type DeleteProjectVariables } from './__generated__/DeleteProject';

const useDeleteProjectMutation = hooks.makeMutation<DeleteProject, DeleteProjectVariables>(gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProjectById(projectId: $projectId)
  }
`);

export default function useDeleteRemoteProject(): (string) => Promise<string | null> {
  const [performDeleteProject, _deleteProjectResponse] = useDeleteProjectMutation();

  async function deleteProject(projectId: string) {
    const result = await performDeleteProject({ variables: { projectId } });

    // we're not passing `ignoreResults`, so there will be a result
    // eslint-disable-next-line no-throw-literal
    if (!result.data) throw 'unreachable';

    return result.data.deleteProjectById ?? null;
  }

  return deleteProject;
}
