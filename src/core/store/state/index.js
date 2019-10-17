// @flow

import connect from '../connect';

const schema = {
  name: 'State',
  tables: [
    {
      name: 'States',
      columns: {
        id: {
          primaryKey: true,
          dataType: 'string',
        },
        state: {
          default: '',
          dataType: 'string',
        },
      },
    },
  ],
};

const connection = connect(schema);

function unique<T>(result: T[]): T {
  // eslint-disable-next-line no-throw-literal
  if (result.length === 0) throw 'not found';
  // eslint-disable-next-line no-throw-literal
  if (result.length > 1) throw 'not unique';
  return result[0];
}

// if you want to check initialization before making the first store access
// it doesn't do anything, but if initialization failed, this will be a rejected promise.
export async function init() {
  await connection;
}

export async function getState(id: string): Promise<string> {
  const conn = await connection;

  return unique(
    await conn.select({
      from: 'States',
      where: [{ id }],
    }),
  ).state;
}

export async function setState(id: string, state: string) {
  const conn = await connection;

  await conn.insert({
    into: 'States',
    values: [{ id, state }],
    upsert: true,
  });
}
