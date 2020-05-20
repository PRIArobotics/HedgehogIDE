// @flow

import * as React from 'react';

import {
  type FilerRecursiveStatInfo,
  Project,
} from '../../../core/store/projects';

type ProjectInfo = {|
  project: Project,
  files: FilerRecursiveStatInfo,
  projectUid: string,
|};

export default function useProjectInfo(
  projectName: string,
): [ProjectInfo | null, () => void] {
  const [state, setState] = React.useState<ProjectInfo | null>(null);

  function refreshProject() {
    (async () => {
      // load project from the file system
      const project = await Project.getProject(projectName);
      const files = await project.getFiles();
      const projectUid = await project.getUid();

      setState({ project, files, projectUid });
    })();
  }

  // refresh project when projectName changes
  React.useEffect(() => {
    refreshProject();
  }, [projectName]);

  return [state, refreshProject];
}
