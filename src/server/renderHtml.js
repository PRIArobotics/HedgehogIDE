import * as React from 'react';
import ReactDOM from 'react-dom/server';

import Html from './Html';

export default function renderHtml(rootComponent, data) {
  const content = ReactDOM.renderToString(rootComponent);
  const html = ReactDOM.renderToStaticMarkup(<Html {...data}>{content}</Html>);
  return `<!doctype html>${html}`;
}
