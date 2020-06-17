// @flow

import gql from 'graphql-tag';

import * as hooks from '../../misc/hooks';

import { type Projects, type Projects_projects as Project } from './__generated__/Projects';

const useProjectsQuery = hooks.makeQuery<Projects, void>(gql`
  query Projects {
    projects {
      id
      name
    }
  }
`);

export default function useRemoteProjects(): [Project[], () => void] {
  const remoteProjectsQuery = useProjectsQuery();
  const remoteProjects = remoteProjectsQuery.data?.projects ?? [];

  function refreshProjects() {
    remoteProjectsQuery.refetch();
  }

  return [remoteProjects, refreshProjects];
}
