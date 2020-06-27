// @flow
/* eslint-disable import/prefer-default-export */

// takes a function that takes a callback `(err, result) => ...`
// as its last parameter and makes it into a function that returns a promise instead
// Flow doesn't manage to capture the type of `(...args, cb) => void` unfortunately,
// so the actual type of the promise can not be inferred, and argument types are not checked.
export function promisify<T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
}

export function mapObject<T, U>(
  obj: {| [key: string]: T |},
  fn: (value: T, key: string) => U,
): {| [key: string]: U |} {
  const entries = Object.entries(obj);
  const newEntries = entries.map(([key, value0]) => {
    // $FlowExpectError
    const value: T = value0;
    return [key, fn(value, key)];
  });
  return Object.fromEntries(newEntries);
}
