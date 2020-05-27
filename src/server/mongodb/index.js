import db from './db';

import * as UserSchema from './schema/User';

export const User = UserSchema.createModel(db);

export default db;
