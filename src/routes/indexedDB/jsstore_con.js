import * as JsStore from 'jsstore';

const getWorkerPath = () => {
  // return dev build when env is development
  if (process.env.NODE_ENV === 'development') {
    return require('jsstore/dist/jsstore.worker');
  }
  // return prod build when env is production
  return require('jsstore/dist/jsstore.worker.min');
};

const workerPath = getWorkerPath();
const connection = new JsStore.Instance(new Worker(workerPath));
export default connection;
