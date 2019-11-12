// @flow

import connection from './connection';

export type {
  File, CreateFile, UpdateFile,
} from './file';
export type {
  FileNode, DirNode, FileTreeNode, DirectoryContents,
  Project, CreateProject, UpdateProject,
} from './project';
export {
  ProjectError,
  getProjects, getProjectById, getProjectByName,
  createProject, updateProject, removeProject,
} from './project';

// if you want to check initialization before making the first store access
// it doesn't do anything, but if initialization failed, this will be a rejected promise.
export async function init() {
  await connection;
}
