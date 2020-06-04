// @flow

import * as React from 'react';

import { Project } from '../../../core/store/projects';

import { useAsyncState } from '../../misc/hooks';

type ProjectInfo = {|
  project: Project,
  projectUid: string,
|};

export default function useProjectInfo(
  projectName: string,
): ProjectInfo | null {
  const [state, setState] = useAsyncState<ProjectInfo | null>(null);

  // refresh project when projectName changes
  React.useEffect(() => {
    async function loadProjectInfo() {
      // load project from the file system
      const project = await Project.getProject(projectName);
      const projectUid = await project.getUid();

      return { project, projectUid };
    }

    setState(loadProjectInfo());
  }, [projectName]);

  return state;
}
