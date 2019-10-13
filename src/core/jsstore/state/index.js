// @flow

import * as JsStore from 'jsstore';

import connection from '../connection';

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

class StateDB {
  connection: JsStore.Instance;
  initPromise: Promise<void>;

  // eslint-disable-next-line no-shadow
  constructor(connection: JsStore.Instance) {
    this.connection = connection;
    this.initPromise = this.connection.initDb(schema);
  }

  // if you want to check initialization before making the first store access
  // it doesn't do anything, but if initialization failed,
  // this will be a rejected promise.
  async init() {
    await this.initPromise;
  }

  async getState(id) {
    await this.initPromise;

    const result = await this.connection.select({
      from: 'States',
      where: [{ id }],
    });

    // eslint-disable-next-line no-throw-literal
    if (result.length === 0) throw 'not found';

    return result[0].state;
  }

  async setState(id, state) {
    await this.initPromise;

    await this.connection.insert({
      into: 'States',
      values: [{ id, state }],
      upsert: true,
    });
  }
}

const STATE_DB = new StateDB(connection);

export default STATE_DB;
