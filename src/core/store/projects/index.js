// @flow

import connect from '../connect';

export type Project = {|
  id?: number,
  name: string,
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
  },
};

const connection = connect({
  name: 'Projects',
  tables: [tblProjects],
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

export async function createProject(project: Project): Promise<void> {
  const conn = await connection;

  try {
    const [{ id }] = await conn.insert({
      into: 'Projects',
      values: [project],
      return: true,
    });

    // eslint-disable-next-line no-param-reassign
    project.id = id;
  } catch (ex) {
    // whatever happened here
    if (typeof ex !== 'object' || ex.type !== 'ConstraintError') throw ex;

    throw new ProjectError('constraint was violated at insertion');
  }
}

export async function updateProject(project: Project): Promise<void> {
  const conn = await connection;

  const { id, ...values } = project;
  const rows = await conn.update({
    in: 'Projects',
    set: values,
    where: { id },
  });

  if (rows !== 1) throw new ProjectError('project not found');
}

export async function removeProject(project: Project): Promise<void> {
  const conn = await connection;

  const { id } = project;
  const rows = await conn.remove({
    from: 'Projects',
    where: { id },
  });

  if (rows !== 1) throw new ProjectError('project not found');
}
