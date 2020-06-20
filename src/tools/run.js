import run from './run.lib';

// eslint-disable-next-line no-underscore-dangle
delete require.cache[__filename];

// eslint-disable-next-line global-require, import/no-dynamic-require
const mod = require(`./${process.argv[2]}.js`).default;

run(mod).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
