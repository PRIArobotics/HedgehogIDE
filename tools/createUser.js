import readline from 'readline';
import bcrypt from 'bcryptjs';

import { User } from '../src/server/data/mongodb';

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export default async function() {
  const username = await new Promise(res =>
    input.question('Username: ', res),
  );

  let password = await new Promise(res =>
    input.question('Password: ', res),
  );

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error(`Error creating user: ${err}`);
      process.exit(1);
    }

    // eslint-disable-next-line no-shadow
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        console.error(`Error creating user: ${err}`);
        process.exit(1);
      }

      // Store hash in your password DB.
      password = hash;
      const user = await User.create({ username, password });
      console.log(`Created user with id '${user._id}'`);
      process.exit(0);
    });
  });
};
