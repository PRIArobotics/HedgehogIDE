import readline from 'readline';
import bcrypt from 'bcryptjs';

import db, { User } from '../server/mongodb';

export default async function createUser() {
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = query =>
    new Promise(resolve => {
      input.question(query, resolve);
    });

  const username = await question('Username: ');
  let password = await question('Password: ');
  input.close();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Store hash in your password DB.
    password = hash;
    try {
      const user = await User.create({ username, password });
      // eslint-disable-next-line no-console
      console.log(`Created user with id '${user._id}'`);
    } finally {
      await db.close();
    }
  } catch (err) {
    console.error(`Error creating user: ${err}`);
    process.exit(1);
  }
}
