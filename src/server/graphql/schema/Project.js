// @flow

import type { GraphqlDefShape } from '../../../core/graphql/graphqlDef';

const def: GraphqlDefShape = {
  schema: [
    `
    type Project {
      id: ID!
      name: String!
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
      data:
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

    input Project {
      id: ID
      name: String!
      fileTree: FileTree!
    }

    input FileTree {
      id: ID
      files: [FileTreeFileRecord!]
      trees: [FileTreeTreeRecord!]
    }

    input FileTreeFileRecord {
      id: ID
      name: String!
      data: String!
    }

    input FileTreeTreeRecord {
      name: String!
      tree: FileTree!
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
    saveProject(Project!): ID!
    `,
  ],
};

export default def;
