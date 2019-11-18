// @flow

import filer, { fs } from 'filer';

const sh = new fs.Shell();

// it's just a string,
// but using this indicates that this should be an existing directory.
export type ProjectName = string;

export type ProjectShell = any;

export class ProjectError extends Error {
  name = 'ProjectError';
}

export async function getProjects(): Promise<Array<ProjectName>> {
  return /* await */ fs.promises.readdir('/');
}

export async function createProject(name: string): Promise<void> {
  try {
    await fs.promises.mkdir(`/${name}`);
  } catch (ex) {
    if (ex instanceof filer.Errors.EEXIST)
      throw new ProjectError('Project name is already in use');
    console.error(ex);
    throw ex;
  }
}

export async function renameProject(
  projectName: ProjectName,
  name: string,
): Promise<void> {
  try {
    await fs.promises.rename(`/${projectName}`, `/${name}`);
  } catch (ex) {
    if (ex instanceof filer.Errors.ENOENT)
      throw new ProjectError('Project does no longer exist');
    if (ex instanceof filer.Errors.EEXIST)
      throw new ProjectError('Project name is already in use');
    console.error(ex);
    throw ex;
  }
}

export async function removeProject(projectName: ProjectName): Promise<void> {
  try {
    // use Shell.rm as it's recursive
    await sh.promises.rm(projectName);
  } catch (ex) {
    if (ex instanceof filer.Errors.ENOENT)
      throw new ProjectError('Project does no longer exist');
    console.error(ex);
    throw ex;
  }
}

export async function getProjectShell(
  projectName: ProjectName,
): Promise<ProjectShell> {
  try {
    // eslint-disable-next-line no-shadow
    const sh = new filer.fs.Shell();
    await sh.promises.cd(`/${projectName}`);
    return sh;
  } catch (ex) {
    if (ex instanceof filer.Errors.ENOTDIR)
      throw new ProjectError('Project does not exist');
    console.error(ex);
    throw ex;
  }
}
