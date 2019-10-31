// @flow

import connect from '../connect';

export type File = {|
  id: number,
  content: ArrayBuffer,
|};

// optional id
export type CreateFile = {|
  id?: number,
  content: ArrayBuffer,
|};

// no id, all fields optional
export type UpdateFile = {|
  content?: ArrayBuffer,
|};

const tblFiles = {
  name: 'Files',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      dataType: 'string',
      notNull: true,
    },
  },
};

// not a JsStore record type
// eslint-disable-next-line no-use-before-define
export type FileTreeNode = FileNode | DirNode;

export type DirectoryContents = { [name: string]: FileTreeNode };

// not a JsStore record type
export type FileNode = {|
  type: 'file',
  fileRef: number,
|};

// not a JsStore record type
export type DirNode = {|
  type: 'dir',
  children: DirectoryContents,
|};

export type Project = {|
  id: number,
  name: string,
  // the children of the implicit root folder
  files: DirectoryContents,
|};

// optional id
export type CreateProject = {|
  id?: number,
  name: string,
  files: DirectoryContents,
|};

// no id, all fields optional
export type UpdateProject = {|
  name?: string,
  files?: DirectoryContents,
|};

const tblProjects = {
  name: 'Projects',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      dataType: 'string',
      notNull: true,
      unique: true,
    },
    files: {
      dataType: 'object',
      notNull: true,
    },
  },
};

const connection = connect({
  name: 'Projects',
  tables: [tblFiles, tblProjects],
});

export class ProjectError extends Error {
  name = 'ProjectError';
}

function unique<T>(result: T[]): T {
  // eslint-disable-next-line no-throw-literal
  if (result.length === 0) throw new ProjectError('no project found');
  // eslint-disable-next-line no-throw-literal
  if (result.length > 1) throw new ProjectError('multiple projects found');
  return result[0];
}

// if you want to check initialization before making the first store access
// it doesn't do anything, but if initialization failed, this will be a rejected promise.
export async function init() {
  await connection;
}

export async function getProjects(): Promise<Array<Project>> {
  const conn = await connection;

  return /* await */ conn.select({
    from: 'Projects',
  });
}

export async function getProjectById(id: number): Promise<Project> {
  const conn = await connection;

  return unique(
    await conn.select({
      from: 'Projects',
      where: { id },
    }),
  );
}

export async function getProjectByName(name: string): Promise<Project> {
  const conn = await connection;

  return unique(
    await conn.select({
      from: 'Projects',
      where: { name },
    }),
  );
}

export async function createProject(project: CreateProject): Promise<Project> {
  const conn = await connection;

  try {
    const [p] = await conn.insert({
      into: 'Projects',
      values: [project],
      return: true,
    });

    return p;
  } catch (ex) {
    // whatever happened here
    if (typeof ex !== 'object' || ex.type !== 'ConstraintError') throw ex;

    throw new ProjectError('constraint was violated at insertion');
  }
}

export async function updateProject(
  project: Project,
  values: UpdateProject,
): Promise<Project> {
  const conn = await connection;

  try {
    const rows = await conn.update({
      in: 'Projects',
      set: values,
      where: { id: project.id },
    });

    if (rows !== 1) throw new ProjectError('project not found');

    return { ...project, ...values };
  } catch (ex) {
    // whatever happened here
    if (typeof ex !== 'object' || ex.type !== 'ConstraintError') throw ex;

    throw new ProjectError('constraint was violated at update');
  }
}

export async function removeProject(project: Project): Promise<void> {
  const conn = await connection;

  const rows = await conn.remove({
    from: 'Projects',
    where: { id: project.id },
  });

  if (rows !== 1) throw new ProjectError('project not found');
}
