// @flow

import * as React from 'react';

import { Project } from '../../../core/store/projects';

import { useAsyncState } from '../../misc/hooks';

export default function useProjectInfo(projectName: string): Project | null {
  const [state, setState] = useAsyncState<Project | null>(null);

  // refresh project when projectName changes
  React.useEffect(() => {
    setState(Project.getProject(projectName));
  }, [projectName]);

  return state;
}
