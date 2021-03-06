// @flow

import base64 from 'base64-js';

import { ApolloError } from 'apollo-server';
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
      data: String!
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
      isPublic: Boolean!
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

    input ProjectUpdateInput {
      name: String
      isPublic: Boolean
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
    deleteProjectById(projectId: ID!): ID @auth
    updateProject(projectId: ID!, project: ProjectUpdateInput!): ID @auth
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
      fileTreeRootId(parent, _args, _context) {
        return parent.fileTreeRoot;
      },
      async fileTrees(parent, _args, _context) {
        return FileTree.find({ project: parent.id });
      },
      async files(parent, _args, _context) {
        return File.find({ project: parent.id });
      },
    },
    File: {
      data(parent, _args, _context) {
        return base64.fromByteArray(parent.data);
      },
    },
    FileTreeRecord: {
      itemId(parent, _args, _context) {
        return parent.ref;
      },
    },
    Mutation: {
      async createProject(_, { project: projectInput }, _context) {
        const session = await db.startSession();
        try {
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
            const savedFilePromises = tree.files.map((file) =>
              File.create(
                [
                  {
                    project: project.id,
                    data: Buffer.from(base64.toByteArray(file.data)),
                  },
                ],
                { session },
              ).then(([savedFile]) => ({
                name: file.name,
                type: 'FILE',
                ref: savedFile.id,
              })),
            );

            const savedTreePromises = tree.trees.map((childTree) =>
              saveFileTree(childTree.tree).then((savedTree) => ({
                name: childTree.name,
                type: 'TREE',
                ref: savedTree.id,
              })),
            );

            const contents = await Promise.all([...savedFilePromises, ...savedTreePromises]);

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
          return project.id;
        } finally {
          await session.endSession();
        }
      },
      async deleteProjectById(_parent, { projectId }) {
        try {
          const deleted = await Project.findByIdAndDelete({ _id: projectId });
          if (deleted?.id) {
            await FileTree.deleteMany({ project: projectId });
            await File.deleteMany({ project: projectId });
          }
          return deleted?.id;
        } catch (err) {
          console.error(err);
          throw new ApolloError('Failed to delete project.');
        }
      },
      async updateProject(_parent, { projectId, project }) {
        try {
          const res = await Project.update({ _id: projectId }, { ...project });
          if (res.n === 0) {
            return null;
          }
          return projectId;
        } catch (err) {
          console.error(err);
          throw new ApolloError('Failed to update project.');
        }
      },
    },
  }),
};

export default def;
