import * as JsStore from 'jsstore';

const workerPath =
  process.env.NODE_ENV === 'production'
    ? require('jsstore/dist/jsstore.worker.min')
    : require('jsstore/dist/jsstore.worker');

const connection = new JsStore.Instance(new Worker(workerPath));
export default connection;
