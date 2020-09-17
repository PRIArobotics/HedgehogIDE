// @flow

import filer, { fs } from 'filer';

const sh = new fs.Shell();

// for the IDE relevant fields of fs.stat() results
export interface FilerStatInfo {
  +node: string; // internal node id (unique)
  // dev: string; // file system name
  +name: string; // the entry's name (basename)
  // size: number; // file size in bytes
  // nlinks: number; // number of links
  // atime: date; // last access time as JS Date Object
  // mtime: date; // last modified time as JS Date Object
  // ctime: date; // creation time as JS Date Object
  // atimeMs: number; // last access time as Unix Timestamp
  // mtimeMs: number; // last modified time as Unix Timestamp
  // ctimeMs: number; // creation time as Unix Timestamp
  +type: 'FILE' | 'DIRECTORY' | 'SYMLINK'; // file type
  // gid: number; // group name
  // uid: number; // owner name
  // mode: number; // permissions
  // version: number; // version of the node

  isFile(): boolean; // Returns true if the node is a file.
  isDirectory(): boolean; // Returns true if the node is a directory.
  // isBlockDevice(): boolean; // Not implemented, returns false.
  // isCharacterDevice(): boolean; // Not implemented, returns false.
  isSymbolicLink(): boolean; // Returns true if the node is a symbolic link.
  // isFIFO(): boolean; // Not implemented, returns false.
  // isSocket(): boolean; // Not implemented, returns false.
}

export type FilerRecursiveDirectoryInfo = FilerStatInfo & {
  // contents are added for sh.ls()
  // eslint-disable-next-line no-use-before-define
  +contents: FilerRecursiveStatInfo[],
};

export type FilerRecursiveStatInfo = FilerRecursiveDirectoryInfo | FilerStatInfo;

/**
 * Given a file, returns the named child file.
 * The operation fails if the given file is not a directory,
 * or if the named child does not exist.
 */
export function getChild(file: FilerRecursiveStatInfo, name: string): FilerRecursiveStatInfo {
  if (!file.isDirectory()) throw new Error(`'${file.name}' is not a directory`);
  // $FlowExpectError
  const directory: FilerRecursiveDirectoryInfo = file;

  // Find the child and make sure it exists
  const child = directory.contents.find(f => f.name === name);
  if (child === undefined) throw new Error(`'${name}' does not exist`);
  return child;
}

/**
 * Given a file, returns one of its descendant files.
 * The first fragment must be the name of a child of the given file,
 * The second the name of one of that file's children and so on.
 * The operation fails if an intermediate file file is not a directory,
 * or if a named descendant does not exist.
 */
export function getDescendant(
  file: FilerRecursiveStatInfo,
  ...fragments: string[]
): FilerRecursiveStatInfo {
  return fragments.reduce(getChild, file);
}

export class ProjectError extends Error {
  name = 'ProjectError';
}

const cmpFile = (a: FilerStatInfo, b: FilerStatInfo) => {
  let result;

  // sort directories before files (& symlinks)
  const typeVal = f => (f.isDirectory() ? 0 : 1);
  result = typeVal(a) - typeVal(b);
  if (result !== 0) return result;

  // sort alphabetically
  result = a.name.localeCompare(b.name);
  if (result !== 0) return result;

  return 0;
};

export class Project {
  name: string;
  uid: string;

  constructor(name: string, uid: string) {
    this.name = name;
    this.uid = uid;
  }

  static async getProjects(): Promise<Project[]> {
    const projects = await sh.promises.ls('/');
    projects.sort((a, b) => a.name.localeCompare(b.name));
    return projects.map(({ name, node: uid }) => new Project(name, uid));
  }

  static async getProject(name: string): Promise<Project> {
    try {
      const path = filer.path.resolve('/', name);
      const { node: uid } = await fs.promises.stat(path);
      return new Project(name, uid);
    } catch (ex) {
      if (ex instanceof filer.Errors.ENOENT)
        throw new ProjectError(`Project "${name}" does not exist`);
      console.error(ex);
      throw ex;
    }
  }

  static async createProject(name: string): Promise<Project> {
    try {
      const path = filer.path.resolve('/', name);
      await fs.promises.mkdir(path);
      const { node: uid } = await fs.promises.stat(path);
      return new Project(name, uid);
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST)
        throw new ProjectError(`Project "${name}" does already exist`);
      console.error(ex);
      throw ex;
    }
  }

  resolve(...fragments: string[]): string {
    return filer.path.resolve('/', this.name, ...fragments);
  }

  get path(): string {
    return this.resolve();
  }

  async getFiles(): Promise<FilerRecursiveStatInfo> {
    function sortRecursively(file: FilerRecursiveStatInfo) {
      if (!file.isDirectory()) return;

      // $FlowExpectError
      const dir: FilerRecursiveDirectoryInfo = file;
      dir.contents.sort(cmpFile);
      dir.contents.forEach(f => sortRecursively(f));
    }

    const [root, contents] = await Promise.all([
      fs.promises.stat(this.path),
      sh.promises.ls(this.path, { recursive: true }),
    ]);

    root.contents = contents;
    sortRecursively(root);

    return root;
  }

  async rename(newName: string): Promise<void> {
    try {
      const newPath = filer.path.resolve('/', newName);
      await fs.promises.rename(this.path, newPath);
      this.name = newName;
    } catch (ex) {
      if (ex instanceof filer.Errors.ENOENT)
        throw new ProjectError(`Project "${this.name}" does no longer exist`);
      if (ex instanceof filer.Errors.EEXIST)
        throw new ProjectError(`Project "${newName}" does already exist`);
      console.error(ex);
      throw ex;
    }
  }

  async delete(): Promise<void> {
    try {
      // use Shell.rm as it supports recursive removal
      await sh.promises.rm(this.path, { recursive: true });
    } catch (ex) {
      if (ex instanceof filer.Errors.ENOENT)
        throw new ProjectError(`Project "${this.name}" does no longer exist`);
      console.error(ex);
      throw ex;
    }
  }
}
