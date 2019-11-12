// @flow

import connection from './connection';

export type File = {|
  id: number,
  content: ArrayBuffer,
|};

// optional id
export type CreateFile = {|
  id?: number,
  content: ArrayBuffer,
|};

// no id, all fields optional
export type UpdateFile = {|
  content?: ArrayBuffer,
|};

export const tblFiles = {
  name: 'Files',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      dataType: 'string',
      notNull: true,
    },
  },
};

