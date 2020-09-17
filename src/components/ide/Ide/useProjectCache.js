// @flow

import * as React from 'react';

import filer, { fs } from 'filer';

import {
  type FilerRecursiveStatInfo,
  type FilerRecursiveDirectoryInfo,
  Project,
  getDescendant,
} from '../../../core/store/projects';

import { useAsyncState } from '../../misc/hooks';

type ProjectCache = {|
  files: FilerRecursiveStatInfo,
  simulatorXml: string | null,
  layoutJson: string | null,
  assets: Map<string, Uint8Array>,
|};

export default function useProjectCache(
  project: Project | null,
): [ProjectCache | null, () => void] {
  const [state, setState] = useAsyncState<ProjectCache | null>(null);

  function refreshProject() {
    if (project === null) {
      setState(null);
      return;
    }

    async function loadAssets(root: FilerRecursiveStatInfo): Promise<Map<string, Uint8Array>> {
      const assetsMap: Map<string, Uint8Array> = new Map();

      let assetsFile: FilerRecursiveStatInfo;
      try {
        assetsFile = getDescendant(root, '.metadata', 'assets');
      } catch (err) {
        console.error(err);
        return assetsMap;
      }

      if (!assetsFile.isDirectory()) return assetsMap;
      // $FlowExpectError
      const assetsDir: FilerRecursiveDirectoryInfo = assetsFile;

      async function walk(prefix: string, files: FilerRecursiveStatInfo[]) {
        await Promise.all(
          files.map(async f => {
            if (f.isDirectory()) {
              // $FlowExpectError
              const dir: FilerRecursiveDirectoryInfo = f;
              await walk(`${prefix}${f.name}/`, dir.contents);
            } else {
              const absolutePath = project.resolve('./.metadata/assets', prefix, f.name);
              const asset = await fs.promises.readFile(absolutePath);
              assetsMap.set(`asset:${prefix}${f.name}`, asset);
            }
          }),
        );
      }

      await walk('', assetsDir.contents);

      return assetsMap;
    }

    async function loadFilesAndAssets(): Promise<
      [FilerRecursiveStatInfo, Map<string, Uint8Array>],
    > {
      const files = await project.getFiles();
      const assets = await loadAssets(files);

      return [files, assets];
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

    async function loadLayoutJson(): Promise<string | null> {
      const absolutePath = project.resolve('./.metadata/layout');
      try {
        const layoutJson = await fs.promises.readFile(absolutePath, 'utf8');
        return layoutJson;
      } catch (ex) {
        if (!(ex instanceof filer.Errors.ENOENT)) {
          throw ex;
        }
        return null;
      }
    }

    async function loadProjectCache() {
      // load project from the file system
      const [[files, assets], simulatorXml, layoutJson] = await Promise.all([
        loadFilesAndAssets(),
        loadSimulatorXml(),
        loadLayoutJson(),
      ]);

      return { files, simulatorXml, layoutJson, assets };
    }

    setState(loadProjectCache());
  }

  // refresh project when projectName changes
  React.useEffect(() => {
    refreshProject();
  }, [project]);

  return [state, refreshProject];
}
