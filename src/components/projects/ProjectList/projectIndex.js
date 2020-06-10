// @flow

import { useStore } from '../../misc/hooks';

type ProjectIndex = {|
  // maps local projectUids onto remote project IDs
  remoteProjects: {| [projectUid: string]: string |},
|};

export default function useProjectIndex(): [
  ProjectIndex | null,
  (ProjectIndex | null) => void,
] {
  function load() {
    // load persisted state from localStorage
    const json = localStorage.getItem('Project-Index');

    const state = {
      // default state
      remoteProjects: {},
      // persisted state
      ...(json ? JSON.parse(json) : null),
    };

    return state;
  }

  function store(state) {
    if (state === null) return;

    localStorage.setItem('Project-Index', JSON.stringify(state));
  }

  return useStore<ProjectIndex | null>(load, store, []);
}
