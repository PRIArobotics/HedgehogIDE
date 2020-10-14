// @flow

import { fs } from 'filer';

import { Project } from '../../core/store/projects';
import { useStore } from '../misc/hooks';

export { Project };

type Encoding = "utf8";

/**
 * Provides access to a file in a local project.
 * The file's content are loaded once, and saved on any modification.
 *
 * This function optionally accepts an encoding of `utf8`, in which case the file will be read and
 * written as utf8 text instead of binary.
 */
export default function useFile(project: Project, path: string, encoding?: Encoding): [string | null, (string) => void] {
  async function load() {
    const absolutePath = project.resolve(path);
    return /* await */ fs.promises.readFile(absolutePath, encoding);
  }

  async function store(content) {
    const absolutePath = project.resolve(path);
    await fs.promises.writeFile(absolutePath, content, encoding);
  }

  return useStore<string>(load, store, [project, path]);
}
