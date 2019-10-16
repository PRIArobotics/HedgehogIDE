// @flow

import * as JsStore from 'jsstore';

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

function unique<T>(result: T[]): T {
  // eslint-disable-next-line no-throw-literal
  if (result.length === 0) throw 'not found';
  // eslint-disable-next-line no-throw-literal
  if (result.length > 1) throw 'not unique';
  return result[0];
}

// if you want to check initialization before making the first store access
// it doesn't do anything, but if initialization failed, this will be a rejected promise.
export async function init() {
  await connection;
}

export async function getProjects(): Promise<Project[]> {
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

export async function getProjectByName(name: string): Promise<Project[]> {
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

  const [{ id }] = await conn.insert({
    into: 'Projects',
    values: [project],
    return: true,
  });

  // eslint-disable-next-line no-param-reassign
  project.id = id;
}

export async function updateProject(project: Project): Promise<void> {
  const conn = await connection;

  const { id, ...values } = project;
  await conn.update({
    in: 'Projects',
    set: values,
    where: { id },
  });
}

export async function removeProject(project: Project): Promise<void> {
  const conn = await connection;

  const { id } = project;
  await conn.remove({
    from: 'Projects',
    where: { id },
  });
}
