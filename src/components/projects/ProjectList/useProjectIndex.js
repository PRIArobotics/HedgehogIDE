// @flow

import * as React from 'react';

import gql from 'graphql-tag';

import * as hooks from '../../misc/hooks';

import { Project } from '../../../core/store/projects';

import {
  type RemoteProjects,
  type RemoteProjects_projects as RemoteProject,
} from './__generated__/RemoteProjects';

export type { RemoteProject };

const useRemoteProjectsQuery = hooks.makeQuery<RemoteProjects, void>(gql`
  query RemoteProjects {
    projects {
      id
      name
    }
  }
`);

type LocalToRemoteIdMap = {| [projectUid: string]: string |};
const useLocalToRemoteIdMap = hooks.makeLocalStorage<LocalToRemoteIdMap>(
  json => ({ ...(json !== null ? JSON.parse(json) : null) }),
  state => JSON.stringify(state),
);

function removeNonexistentMapEntries(remoteProjects: RemoteProject[]) {
  return (oldMap: LocalToRemoteIdMap) => {
    // $FlowExpectError
    const oldEntries: [string, string][] = Object.entries(oldMap);
    const newEntries = oldEntries.flatMap(entry => {
      const [_projectUid, remoteId] = entry;

      // skip any entries that refer to nonexistent remote projects
      if (remoteProjects.findIndex(project => project.id === remoteId) === -1) return [];

      return [entry];
    });

    if (oldEntries.length === newEntries.length) return oldMap;

    const newMap: LocalToRemoteIdMap = Object.fromEntries(newEntries);
    return newMap;
  };
}

type LocalToRemoteMap = {| [projectUid: string]: RemoteProject |};
type RemoteToLocalMap = {| [remoteId: string]: Project[] |};
type ProjectIndex = {|
  localProjects: Project[],
  remoteProjects: RemoteProject[],
  // maps local projectUids onto remote projects
  localToRemoteMap: LocalToRemoteMap,
  // maps remote project IDs onto a list of local projects
  remoteToLocalMap: RemoteToLocalMap,
|};

type ProjectIndexAction =
  | {| type: 'REFRESH_LOCAL' |}
  | {| type: 'REFRESH_REMOTE' |}
  | {| type: 'ADD_MAPPING', projectUid: string, remoteId: string |}
  | {| type: 'REMOVE_MAPPING', projectUid: string |};

export default function useProjectIndex(): [ProjectIndex, (ProjectIndexAction) => void] {
  const [localToRemoteIdMap, setLocalToRemoteIdMap] = useLocalToRemoteIdMap('Project-Index');
  const remoteProjectsQuery = useRemoteProjectsQuery();
  const [localProjects, setLocalProjects] = hooks.useAsyncState<Project[]>([]);

  async function refreshRemoteProjects() {
    const result = await remoteProjectsQuery.refetch();
    const remoteProjects = result.data?.projects ?? [];
    setLocalToRemoteIdMap(removeNonexistentMapEntries(remoteProjects));
  }

  function refreshLocalProjects() {
    setLocalProjects(Project.getProjects());
  }

  React.useEffect(() => {
    refreshLocalProjects();
  }, []);

  // call removeNonexistentMapEntries once after remote projects have initially loaded
  const initialLoadRef = React.useRef<boolean>(true);
  React.useEffect(() => {
    if (!initialLoadRef.current || !remoteProjectsQuery.data) return;
    initialLoadRef.current = false;

    const remoteProjects = remoteProjectsQuery.data.projects;
    setLocalToRemoteIdMap(removeNonexistentMapEntries(remoteProjects));
  }, [remoteProjectsQuery.data]);

  function dispatch(action: ProjectIndexAction) {
    switch (action.type) {
      case 'REFRESH_LOCAL': {
        refreshLocalProjects();
        return;
      }
      case 'REFRESH_REMOTE': {
        refreshRemoteProjects();
        return;
      }
      case 'ADD_MAPPING': {
        const { projectUid, remoteId } = action;
        setLocalToRemoteIdMap(oldMap => ({
          ...oldMap,
          [projectUid]: remoteId,
        }));
        return;
      }
      case 'REMOVE_MAPPING': {
        const { projectUid } = action;
        setLocalToRemoteIdMap(({ [projectUid]: _, ...newMap }) => newMap);
        return;
      }
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
  }

  const remoteProjects = remoteProjectsQuery.data?.projects ?? [];
  const localToRemoteMap: LocalToRemoteMap = {};
  const remoteToLocalMap: RemoteToLocalMap = {};

  for (const [projectUid, remoteId0] of Object.entries(localToRemoteIdMap)) {
    // $FlowExpectError
    const remoteId: string = remoteId0;

    const localProject = localProjects.find(project => project.uid === projectUid);
    const remoteProject = remoteProjects.find(project => project.id === remoteId);
    if (localProject !== undefined && remoteProject !== undefined) {
      localToRemoteMap[projectUid] = remoteProject;
      if (!(remoteId in remoteToLocalMap)) remoteToLocalMap[remoteId] = [];
      remoteToLocalMap[remoteId].push(localProject);
    }
  }

  const state = {
    localProjects,
    remoteProjects,
    localToRemoteMap,
    remoteToLocalMap,
  };

  return [state, dispatch];
}
