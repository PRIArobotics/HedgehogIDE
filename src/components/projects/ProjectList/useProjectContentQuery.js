// @flow

import * as React from 'react';

import base64 from 'base64-js';
import filer, { fs } from 'filer';
import gql from 'graphql-tag';

import * as hooks from '../../misc/hooks';

import { Project } from '../../../core/store/projects';

import {
  type RemoteProjectContent,
  type RemoteProjectContentVariables,
  type RemoteProjectContent_projectById as RemoteProjectContents,
  type RemoteProjectContent_projectById_fileTrees_contents as FileTree,
} from './__generated__/RemoteProjectContent';

export type { RemoteProjectContents };

const useRemoteProjectContentQuery = hooks.makeLazyQuery<
  RemoteProjectContent,
  RemoteProjectContentVariables,
>(gql`
  query RemoteProjectContent($projectId: ID!) {
    projectById(id: $projectId) {
      id
      fileTreeRootId
      fileTrees {
        id
        contents {
          name
          type
          itemId
        }
      }
      files {
        id
        data
      }
    }
  }
`);

export async function populateProject(project: Project, contents: RemoteProjectContents) {
  // prettier-ignore
  const fileTrees = Object.fromEntries(contents.fileTrees.map(({ id, contents }) => [id, contents]));
  const files = Object.fromEntries(contents.files.map(({ id, data }) => [id, data]));

  async function visitChildren(fileTree: FileTree[], path: string[]) {
    return Promise.all(fileTree.map(async ({ name, type, itemId }) => {
      const absolutePath = project.resolve(...path, name);
      switch (type) {
        case 'FILE': {
          const data = filer.Buffer.from(base64.toByteArray(files[itemId]));
          await fs.promises.writeFile(absolutePath, data);
          break;
        }
        case 'TREE': {
          await fs.promises.mkdir(absolutePath);
          await visitChildren(fileTrees[itemId], [...path, name]);
          break;
        }
      }
    }));
  }

  await visitChildren(fileTrees[contents.fileTreeRootId], []);
}

export default function useProjectContentQuery(): (
  projectId: string,
) => Promise<RemoteProjectContents> {
  // this construction is to get a result out of useLazyQuery as a promise:
  // we assume there are no concurrent requests
  // At some point, there will be data for the latest request. When this happens, we have already
  // saved a resolve callback, so in an effect, we invoke that callback with the latest result.

  const [executeQuery, projectContentResponse] = useRemoteProjectContentQuery();
  const resolveRef = React.useRef<{|
    projectId: string,
    resolve: RemoteProjectContents => void,
    reject: Error => void,
  |} | null>(null);

  React.useEffect(() => {
    const { variables, data, error } = projectContentResponse;
    if (!data && !error) return;

    // we assume there are no concurrent requests
    // eslint-disable-next-line no-throw-literal
    if (resolveRef.current === null) throw 'unreachable';

    const { projectId, resolve, reject } = resolveRef.current;
    resolveRef.current = null;

    // we assume there are no concurrent requests
    // eslint-disable-next-line no-throw-literal
    if (variables.projectId !== projectId) throw 'unreachable';

    if (data) resolve(data.projectById);
    else if (error) reject(error);
    // eslint-disable-next-line no-throw-literal
    else throw 'unreachable';
  }, [projectContentResponse]);

  async function loadProjectContent(projectId: string) {
    // we assume there are no concurrent requests
    // eslint-disable-next-line no-throw-literal
    if (resolveRef.current !== null) throw 'unreachable';

    return new Promise((resolve, reject) => {
      resolveRef.current = { projectId, resolve, reject };
      executeQuery({ variables: { projectId } });
    });
  }

  return loadProjectContent;
}
