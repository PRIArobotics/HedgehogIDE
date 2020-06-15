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

        const project = (await Project.create(
          [
            {
              name: projectInput.name,
              isPublic: projectInput.isPublic,
            },
          ],
          { session },
        ))[0];

        const saveFileTree = async tree => {
          if (!tree.files) {
            // eslint-disable-next-line no-param-reassign
            tree.files = [];
          }

          if (!tree.trees) {
            // eslint-disable-next-line no-param-reassign
            tree.trees = [];
          }

          const savedFiles = await Promise.all(
            tree.files.map(file =>
              File.create(
                [
                  {
                    project: project.id,
                    data: file.data,
                  },
                ],
                { session },
              ).then(res => ({
                name: file.name,
                type: 'File',
                file: res[0].id,
              })),
            ),
          );

          const savedTrees = await Promise.all(
            tree.trees.map(childTree =>
              saveFileTree(childTree.tree).then(savedTree => ({
                name: childTree.name,
                type: 'Tree',
                tree: savedTree.id,
              })),
            ),
          );

          return (await FileTree.create(
            [
              {
                project: project.id,
                contents: [...savedFiles, ...savedTrees],
              },
            ],
            { session },
          ))[0];
        };

        project.fileTreeRoot = (await saveFileTree(projectInput.fileTree)).id;
        await project.save();
        await session.endSession();
        return project.id;
      },
    },
  }),
};

export default def;
