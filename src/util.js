// @flow

// takes a function that takes a callback `(err, result) => ...`
// as its last parameter and makes it into a function that
// returns a promise instead
// eslint-disable-next-line import/prefer-default-export
export const promisify = fn => (...args) =>
  new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
