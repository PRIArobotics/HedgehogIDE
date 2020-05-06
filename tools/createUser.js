import readline from 'readline';
import bcrypt from 'bcryptjs';

import { User } from '../src/server/data/mongodb';

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = prompt => new Promise(resolve => {
  input.question(prompt, resolve);
});

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
  const username = await question('Username: ');
  let password = await question('Password: ');

  try {
    const salt = await promisify(bcrypt.genSalt)(10);
    const hash = await promisify(bcrypt.hash)(password, salt);

    // Store hash in your password DB.
    password = hash;
    const user = await User.create({ username, password });
    console.log(`Created user with id '${user._id}'`);
    process.exit(0);
  } catch (err) {
    console.error(`Error creating user: ${err}`);
    process.exit(1);
  }
};
