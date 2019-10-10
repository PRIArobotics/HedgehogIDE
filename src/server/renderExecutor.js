import React from 'react';
import ReactDOM from 'react-dom/server';

import { loadScripts } from './loaders';

export default function renderExecutor() {
  const scripts = loadScripts('executor');

  const html = ReactDOM.renderToStaticMarkup(
    <html>
      <head>
        <meta charSet="utf-8" />
        {scripts.map(script => (
          <link key={script} rel="preload" href={script} as="script" />
        ))}
      </head>
      <body>
        {scripts.map(script => (
          <script key={script} src={script} />
        ))}
      </body>
    </html>,
  );
  return `<!doctype html>${html}`;
}
