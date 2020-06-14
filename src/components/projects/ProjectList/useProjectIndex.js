// @flow

import { makeLocalStorage } from '../../misc/hooks';

type ProjectIndex = {|
  // maps local projectUids onto remote project IDs
  remoteProjects: {| [projectUid: string]: string |},
|};

const useStorage = makeLocalStorage<ProjectIndex>(
  json => ({
    // default state
    remoteProjects: {},
    // persisted state
    ...(json !== null ? JSON.parse(json) : null),
  }),
  state => JSON.stringify(state),
);

export default function useProjectIndex(): [
  ProjectIndex,
  (ProjectIndex) => void,
] {
  return useStorage('Project-Index');
}
