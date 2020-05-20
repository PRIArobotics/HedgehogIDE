// @flow

import { fs } from 'filer';

import { Project } from '../../core/store/projects';
import { useStore } from '../misc/hooks';

export { Project };

function useFile(
  project: Project,
  path: string,
): [string | null, (string) => void] {
  async function load() {
    const absolutePath = project.resolve(path);
    return /* await */ fs.promises.readFile(absolutePath, 'utf8');
  }

  async function store(content) {
    const absolutePath = project.resolve(path);
    await fs.promises.writeFile(absolutePath, content, 'utf8');
  }

  return useStore<string>(load, store, [project, path]);
}

export default useFile;
