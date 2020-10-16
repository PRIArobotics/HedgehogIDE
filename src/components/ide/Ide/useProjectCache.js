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

type InternalCache = {|
  files: FilerRecursiveStatInfo,
  simulatorXml: string | null,
  layoutJson: string | null,
  assetBuffers: Map<string, Uint8Array>,
|};

type ProjectCache = {|
  files: FilerRecursiveStatInfo,
  simulatorXml: string | null,
  layoutJson: string | null,
  assets: Map<string, [string, Uint8Array]>,
|};

export default function useProjectCache(
  project: Project | null,
): [ProjectCache | null, () => void] {
  const [internalState, setInternalState] = useAsyncState<InternalCache | null>(null);

  function refreshProject() {
    if (project === null) {
      setInternalState(null);
      return;
    }

    async function loadAssets(root: FilerRecursiveStatInfo): Promise<Map<string, Uint8Array>> {
      const assetBuffers: Map<string, Uint8Array> = new Map();

      let assetsFile: FilerRecursiveStatInfo;
      try {
        assetsFile = getDescendant(root, '.metadata', 'assets');
      } catch (err) {
        console.error(err);
        return assetBuffers;
      }

      if (!assetsFile.isDirectory()) return assetBuffers;
      // $FlowExpectError
      const assetsDir: FilerRecursiveDirectoryInfo = assetsFile;

      async function walk(prefix: string, files: FilerRecursiveStatInfo[]) {
        await Promise.all(
          files.map(async (f) => {
            if (f.isDirectory()) {
              // $FlowExpectError
              const dir: FilerRecursiveDirectoryInfo = f;
              await walk(`${prefix}${f.name}/`, dir.contents);
            } else {
              const absolutePath = project.resolve('./.metadata/assets', prefix, f.name);
              const buffer = await fs.promises.readFile(absolutePath);
              assetBuffers.set(`asset:${prefix}${f.name}`, buffer);
            }
          }),
        );
      }

      await walk('', assetsDir.contents);

      return assetBuffers;
    }

    async function loadFilesAndAssets(): Promise<
      [FilerRecursiveStatInfo, Map<string, Uint8Array>],
    > {
      const files = await project.getFiles();
      const assetBuffers = await loadAssets(files);

      return [files, assetBuffers];
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

    async function loadProjectCache(): Promise<InternalCache> {
      // load project from the file system
      const [[files, assetBuffers], simulatorXml, layoutJson] = await Promise.all([
        loadFilesAndAssets(),
        loadSimulatorXml(),
        loadLayoutJson(),
      ]);

      return { files, simulatorXml, layoutJson, assetBuffers };
    }

    setInternalState(loadProjectCache());
  }

  // refresh project when projectName changes
  React.useEffect(() => {
    refreshProject();
  }, [project]);

  const [state, setState] = React.useState<ProjectCache | null>(null);

  // provide blob URLs for assets
  React.useEffect(() => {
    if (internalState === null) {
      setState(null);
      return undefined;
    }

    const { files, simulatorXml, layoutJson, assetBuffers } = internalState;

    const urls = [];
    const assets: Map<string, [string, Uint8Array]> = new Map();
    for (const [key, buffer] of assetBuffers) {
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      urls.push(url);
      assets.set(key, [url, buffer]);
    }

    setState({ files, simulatorXml, layoutJson, assets });

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [internalState]);

  return [state, refreshProject];
}
