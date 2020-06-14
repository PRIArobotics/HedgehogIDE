// @flow

import * as React from 'react';

import { makeLocalStorage } from '../../misc/hooks';

import { Project } from '../../../core/store/projects';

// maps local projectUids onto remote project IDs
type RemoteProjects = {| [projectUid: string]: string |};
// maps remote project IDs onto a list of local projects
type LocalProjects = {| [remoteId: string]: Project[] |};

const useStorage = makeLocalStorage<RemoteProjects>(
  json => ({
    // persisted state
    ...(json !== null ? JSON.parse(json) : null),
  }),
  state => JSON.stringify(state),
);

type ProjectIndex = {|
  remoteProjects: RemoteProjects,
  localProjects: LocalProjects,
|};

export default function useProjectIndex(
  localProjectsArray: Project[],
): [ProjectIndex, (RemoteProjects) => void] {
  const [remoteProjects, setRemoteProjects] = useStorage('Project-Index');

  function computeProjectIndex(): ProjectIndex {
    // remoteProjects maps local project IDs to remote project IDs
    // we also need the list of local projects per remote project ID.
    // compute that here.
    const localProjects: LocalProjects = {};
    localProjectsArray.forEach(localProject => {
      if (localProject.uid in remoteProjects) {
        const remoteId = remoteProjects[localProject.uid];
        if (!(remoteId in localProjects)) localProjects[remoteId] = [];
        localProjects[remoteId].push(localProject);
      }
    });

    return {
      remoteProjects,
      localProjects,
    };
  }

  const [projectIndex, setProjectIndex] = React.useState<ProjectIndex>(
    computeProjectIndex,
  );

  React.useEffect(() => {
    setProjectIndex(computeProjectIndex());
  }, [localProjectsArray, remoteProjects]);

  return [projectIndex, setRemoteProjects];
}
