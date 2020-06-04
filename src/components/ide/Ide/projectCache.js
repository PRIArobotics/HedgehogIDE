// @flow

import * as React from 'react';

import filer, { fs } from 'filer';

import {
  type FilerRecursiveStatInfo,
  Project,
} from '../../../core/store/projects';

type ProjectCache = {|
  files: FilerRecursiveStatInfo,
  simulatorXml: string | null,
|};

export default function useProjectCache(
  project: Project | null,
): [ProjectCache | null, () => void] {
  const [state, setState] = React.useState<ProjectCache | null>(null);

  function refreshProject() {
    if (project === null) {
      setState(null);
      return;
    }

    async function loadSimulatorXml(): Promise<string | null> {
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
      const files = await project.getFiles();
      const simulatorXml = await loadSimulatorXml();

      setState({ files, simulatorXml });
    })();
  }

  // refresh project when projectName changes
  React.useEffect(() => {
    refreshProject();
  }, [project]);

  return [state, refreshProject];
}
