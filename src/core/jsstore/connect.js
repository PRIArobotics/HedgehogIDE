import * as JsStore from 'jsstore';

const workerPath =
  process.env.NODE_ENV === 'production'
    ? require('jsstore/dist/jsstore.worker.min')
    : require('jsstore/dist/jsstore.worker');

export default async function connect(schema): Promise<JsStore.Instance> {
  const connection = new JsStore.Instance(new Worker(workerPath));
  await connection.initDb(schema);
  return connection;
}
