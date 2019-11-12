// @flow

import filer from 'filer';

const fs = filer.fs;
const sh = new fs.Shell();

// it's just a string,
// but using this indicates that this should be an existing directory
export type Project = string;

export class ProjectError extends Error {
  name = 'ProjectError';
}

export async function getProjects(): Promise<Array<Project>> {
  return /* await */ fs.promises.readdir('/');
}

export async function createProject(name: string): Promise<void> {
  try {
    await fs.promises.mkdir(`/${name}`);
  } catch (ex) {
    if(ex instanceof filer.Errors.EEXIST)
      throw new ProjectError('Project name is already in use');
    console.error(ex);
    throw ex;
  }
}

export async function renameProject(
  project: Project,
  name: string,
): Promise<void> {
  try {
    await fs.promises.rename(`/${project}`, `/${name}`);
  } catch (ex) {
    if(ex instanceof filer.Errors.ENOENT)
      throw new ProjectError('Project does no longer exist');
    if(ex instanceof filer.Errors.EEXIST)
      throw new ProjectError('Project name is already in use');
    console.error(ex);
    throw ex;
  }
}

export async function removeProject(project: Project): Promise<void> {
  try {
    // use Shell.rm as it's recursive
    await sh.promises.rm(project);
  } catch (ex) {
    if(ex instanceof filer.Errors.ENOENT)
      throw new ProjectError('Project does no longer exist');
    console.error(ex);
    throw ex;
    }
}
