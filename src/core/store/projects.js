// @flow

import filer, { fs } from 'filer';

const sh = new fs.Shell();

export class ProjectError extends Error {
  name = 'ProjectError';
}

export class Project {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  static async getProjects(): Promise<Array<Project>> {
    const projectNames = await fs.promises.readdir('/');
    return projectNames.map(name => new Project(name));
  }

  static async getProject(name: string): Promise<Project> {
    try {
      const path = filer.path.resolve('/', name);
      await fs.promises.stat(path);
      return new Project(name);
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
      return new Project(name);
    } catch (ex) {
      if (ex instanceof filer.Errors.EEXIST)
        throw new ProjectError(`Project "${name}" does already exist`);
      console.error(ex);
      throw ex;
    }
  }

  resolve(...fragments: Array<string>): string {
    return filer.path.resolve('/', this.name, ...fragments);
  }

  get path(): string {
    return this.resolve();
  }

  async getFiles(): Promise<Array<any>> {
    return sh.promises.ls(this.path, { recursive: true });
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
