import db from './db';

import * as UserSchema from './schema/User';
import * as ProjectSchema from './schema/Project';

export const User = UserSchema.createModel(db);
export const Project = ProjectSchema.createProjectModel(db);
export const FileTree = ProjectSchema.createFileTreeModel(db);
export const File = ProjectSchema.createFileModel(db);

export default db;
