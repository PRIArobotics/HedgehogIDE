// @flow

import * as React from 'react';

import * as hooks from '../../misc/hooks';

import { Project } from '../../../core/store/projects';

export default function useLocalProjects(): [Project[], () => void] {
  const [projects, setProjects] = hooks.useAsyncState<Project[]>([]);

  function refreshProjects() {
    setProjects(Project.getProjects());
  }

  React.useEffect(() => {
    refreshProjects();
  }, []);

  return [projects, refreshProjects];
}
