import run from '../src/tools/run.lib';

export { default, format } from '../src/tools/run.lib';

if (require.main === module && process.argv.length > 2) {
  global.__DEV__ = process.env.__DEV__;

  // eslint-disable-next-line no-underscore-dangle
  delete require.cache[__filename];

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const module = require(`./${process.argv[2]}.js`).default;

  run(module).catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
}
