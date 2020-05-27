// @flow

import type { GraphqlDefShape } from '../../../core/graphql/graphqlDef';

const def: GraphqlDefShape = {
  schema: [
    `
    type Project {
      id: ID!
      name: String!
      isPublic: Boolean!
      fileTreeRootId: ID!
      fileTrees: [FileTree!]
      files: [File!]
    }

    type FileTree {
      id: ID!
      contents: [FileTreeRecord!]
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
      files: [FileTreeFileRecordInput!]
      trees: [FileTreeTreeRecordInput!]
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
    projects: [Project!]
    projectById(id: ID!): Project!
    `,
  ],
  mutations: [
    `
    saveProject(project: ProjectInput!) : ID! @auth
    `,
  ],
  resolvers: () => ({
    Mutation: {
      async saveProject(_, project) {
        console.log(project);
      },
    },
  }),
};

export default def;
