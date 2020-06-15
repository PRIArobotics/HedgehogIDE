// @flow

import type { GraphqlDefShape } from '../../../core/graphql/graphqlDef';

import db, { File, FileTree, Project } from '../../mongodb';

const def: GraphqlDefShape = {
  schema: [
    `
    type Project {
      id: ID!
      name: String!
      isPublic: Boolean!
      fileTreeRootId: ID!
      fileTrees: [FileTree!]!
      files: [File!]!
    }

    type FileTree {
      id: ID!
      contents: [FileTreeRecord!]!
    }

    type File {
      id: ID!
      data: String
    }

    type FileTreeRecord {
      name: String!
      type: FileTreeRecordType!
      itemId: ID!
    }

    enum FileTreeRecordType {
      FILE
      TREE
    }

    input ProjectInput {
      id: ID
      name: String!
      fileTree: FileTreeInput!
    }

    input FileTreeInput {
      id: ID
      files: [FileTreeFileRecordInput!]!
      trees: [FileTreeTreeRecordInput!]!
    }

    input FileTreeFileRecordInput {
      id: ID
      name: String!
      data: String!
    }

    input FileTreeTreeRecordInput {
      name: String!
      tree: FileTreeInput!
    }
    `,
  ],
  queries: [
    `
    projects: [Project!]!
    projectById(id: ID!): Project!
    `,
  ],
  mutations: [
    `
    createProject(project: ProjectInput!) : ID! @auth
    `,
  ],
  resolvers: () => ({
    RootQuery: {
      async projects(_, _args, _context) {
        return /* await */ Project.find({});
      },
      async projectById(_, { id }, _context) {
        return /* await */ Project.findById(id);
      },
    },
    Project: {
      isPublic(_parent, _args, _context) {
        return true;
      },
      fileTreeRootId(parent, _args, _context) {
        return parent.fileTreeRoot;
      },
      fileTrees(_parent, _args, _context) {
        return [];
      },
      files(_parent, _args, _context) {
        return [];
      },
    },
    Mutation: {
      async createProject(_, { project: projectInput }, _context) {
        const session = await db.startSession();

        const [project] = await Project.create(
          [
            {
              name: projectInput.name,
              isPublic: projectInput.isPublic,
            },
          ],
          { session },
        );

        async function saveFileTree(tree) {
          if (!tree.files) {
            // eslint-disable-next-line no-param-reassign
            tree.files = [];
          }

          if (!tree.trees) {
            // eslint-disable-next-line no-param-reassign
            tree.trees = [];
          }

          const savedFilePromises = tree.files.map(file =>
            File.create(
              [
                {
                  project: project.id,
                  data: file.data,
                },
              ],
              { session },
            ).then(([savedFile]) => ({
              name: file.name,
              type: 'File',
              file: savedFile.id,
            })),
          );

          const savedTreePromises = tree.trees.map(childTree =>
            saveFileTree(childTree.tree).then(savedTree => ({
              name: childTree.name,
              type: 'Tree',
              tree: savedTree.id,
            })),
          );

          const contents = await Promise.all([
            ...savedFilePromises,
            ...savedTreePromises,
          ]);

          const [fileTree] = await FileTree.create(
            [
              {
                project: project.id,
                contents,
              },
            ],
            { session },
          );

          return fileTree;
        }

        const root = await saveFileTree(projectInput.fileTree);
        project.fileTreeRoot = root.id;
        await project.save();
        await session.endSession();
        return project.id;
      },
    },
  }),
};

export default def;
