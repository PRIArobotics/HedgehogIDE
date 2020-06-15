// @flow

import gql from 'graphql-tag';

import { fs } from 'filer';

import * as hooks from '../../misc/hooks';

import {
  Project,
  type FilerStatInfo,
  type FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';

import {
  type CreateProject,
  type CreateProjectVariables,
  type ProjectInput,
  type FileTreeFileRecordInput,
  type FileTreeTreeRecordInput,
} from './__generated__/CreateProject';

const useCreateProjectMutation = hooks.makeMutation<
  CreateProject,
  CreateProjectVariables,
>(gql`
  mutation CreateProject($projectInput: ProjectInput!) {
    createProject(project: $projectInput)
  }
`);

async function projectToInput(project: Project): Promise<ProjectInput> {
  async function visitFile(
    file: FilerStatInfo,
    path: string[],
  ): Promise<FileTreeFileRecordInput> {
    const { name } = file;
    const absolutePath = project.resolve(...path, name);
    const data = await fs.promises.readFile(absolutePath);
    return { name, data };
  }

  async function visitDirectory(
    directory: FilerRecursiveDirectoryInfo,
    path: string[],
  ): Promise<FileTreeTreeRecordInput> {
    const { name } = directory;
    const filePromises: Promise<FileTreeFileRecordInput>[] = [];
    const treePromises: Promise<FileTreeTreeRecordInput>[] = [];

    const newPath = [...path, name];
    for (const file of directory.contents) {
      if (file.isDirectory()) {
        // $FlowExpectError
        treePromises.push(visitDirectory(file, newPath));
      } else {
        filePromises.push(visitFile(file, newPath));
      }
    }

    const [files, trees] = await Promise.all([
      Promise.all(filePromises),
      Promise.all(treePromises),
    ]);

    return { name, tree: { files, trees } };
  }

  // $FlowExpectError
  const files: FilerRecursiveDirectoryInfo = await project.getFiles();
  // discard the name, it's not part of the FileTreeInput
  const { tree: fileTree } = await visitDirectory(files, []);

  return {
    name: project.name,
    isPublic: true,
    fileTree,
  };
}

export default function useCreateRemoteProject(): Project => Promise<string> {
  const [
    performCreateProject,
    _createProjectResponse,
  ] = useCreateProjectMutation();

  async function createProject(project: Project) {
    const projectInput = await projectToInput(project);
    const result = await performCreateProject({ variables: { projectInput } });

    // we're not passing `ignoreResults`, so there will be a result
    // eslint-disable-next-line no-throw-literal
    if (!result.data) throw 'unreachable';

    return result.data.createProject;
  }

  return createProject;
}
