// @flow

import * as JsStore from 'jsstore';

import connect from '../connect';

const schema = {
  name: 'IndexDBState',
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

class StateDB {
  connection: Promise<JsStore.Instance>;

  // eslint-disable-next-line no-shadow
  constructor(connection: Promise<JsStore.Instance>) {
    this.connection = connection;
  }

  // if you want to check initialization before making the first store access
  // it doesn't do anything, but if initialization failed,
  // this will be a rejected promise.
  async init() {
    await this.connection;
  }

  async getState(id) {
    const connection = await this.connection;

    const result = await connection.select({
      from: 'States',
      where: [{ id }],
    });

    // eslint-disable-next-line no-throw-literal
    if (result.length === 0) throw 'not found';

    return result[0].state;
  }

  async setState(id, state) {
    const connection = await this.connection;

    await connection.insert({
      into: 'States',
      values: [{ id, state }],
      upsert: true,
    });
  }
}

export default new StateDB(connection);
