// @flow

import * as React from 'react';

import { Project } from '../../../core/store/projects';

type ProjectInfo = {|
  project: Project,
  projectUid: string,
|};

export default function useProjectInfo(
  projectName: string,
): ProjectInfo | null {
  const [state, setState] = React.useState<ProjectInfo | null>(null);

  // refresh project when projectName changes
  React.useEffect(() => {
    (async () => {
      // load project from the file system
      const project = await Project.getProject(projectName);
      const projectUid = await project.getUid();

      setState({ project, projectUid });
    })();
  }, [projectName]);

  return state;
}
