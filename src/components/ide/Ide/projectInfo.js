// @flow

import * as React from 'react';

import filer, { fs } from 'filer';

import {
  type FilerRecursiveStatInfo,
  Project,
} from '../../../core/store/projects';

type ProjectInfo = {|
  project: Project,
  files: FilerRecursiveStatInfo,
  projectUid: string,
  simulatorXml: string | null,
|};

export default function useProjectInfo(
  projectName: string,
): [ProjectInfo | null, () => void] {
  const [state, setState] = React.useState<ProjectInfo | null>(null);

  function refreshProject() {
    async function loadSimulatorXml(project: Project): Promise<string | null> {
      const absolutePath = project.resolve('./.metadata/simulator');
      try {
        const workspaceXml = await fs.promises.readFile(absolutePath, 'utf8');
        if (workspaceXml === '') return null;
        return workspaceXml;
      } catch (ex) {
        if (!(ex instanceof filer.Errors.ENOENT)) {
          throw ex;
        }
        return null;
      }
    }

    (async () => {
      // load project from the file system
      const project = await Project.getProject(projectName);
      const files = await project.getFiles();
      const projectUid = await project.getUid();
      const simulatorXml = await loadSimulatorXml(project);

      setState({ project, files, projectUid, simulatorXml });
    })();
  }

  // refresh project when projectName changes
  React.useEffect(() => {
    refreshProject();
  }, [projectName]);

  return [state, refreshProject];
}
