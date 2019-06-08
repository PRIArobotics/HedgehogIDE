import { ServerStyleSheets } from '@material-ui/styles';

// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved

export class IsomorphicStyleLoader {
  css = new Set();

  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss(...styles) {
    // eslint-disable-next-line no-underscore-dangle
    styles.forEach(style => this.css.add(style._getCss()));
  }

  collect() {
    return [...this.css].join('');
  }
}

export function loadScripts(...chnks) {
  const scripts = new Set();

  chnks.forEach(chunk => {
    if (chunks[chunk]) {
      // add all assets belonging to that chunk
      chunks[chunk].forEach(asset => scripts.add(asset));
    } else if (__DEV__) {
      throw new Error(`Chunk with name '${chunk}' cannot be found`);
    }
  });

  return [...scripts];
}

export class MaterialStyleLoader {
  sss = new ServerStyleSheets();

  wrap(component) {
    return this.sss.collect(component);
  }

  collect() {
    return this.sss.toString();
  }
}
