import readline from 'readline';
import bcrypt from 'bcryptjs';

import db, { User } from '../src/server/data/mongodb';

// takes a function that takes a callback `(err, result) => ...`
// as its last parameter and makes it into a function that
// returns a promise instead
const promisify = fn => (...args) => new Promise((resolve, reject) => {
  fn(...args, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

export default async function() {
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = query => new Promise(resolve => {
    input.question(query, resolve);
  });

  const username = await question('Username: ');
  let password = await question('Password: ');
  input.close();

  try {
    const salt = await promisify(bcrypt.genSalt)(10);
    const hash = await promisify(bcrypt.hash)(password, salt);

    // Store hash in your password DB.
    password = hash;
    try {
      const user = await User.create({ username, password });
      console.log(`Created user with id '${user._id}'`);
    } finally {
      await db.close();
    }
  } catch (err) {
    console.error(`Error creating user: ${err}`);
    process.exit(1);
  }
};
