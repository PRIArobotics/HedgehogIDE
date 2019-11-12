// @flow

import connect from '../connect';

import { tblFiles } from './file';
import { tblProjects } from './project';

const connection = connect({
  name: 'Projects',
  tables: [tblFiles, tblProjects],
});

export default connection;
