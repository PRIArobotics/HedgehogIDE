// @flow

import * as React from 'react';

import Layout from '../../components/layout/Layout';
import NoSSR from '../../components/misc/NoSSR';

async function action() {
  const showIndexedDB = async () => {
    const { default: IndexedDB } = await import('./IndexedDB');

    return <IndexedDB />;
  };
  return {
    title: 'IndexedDB',
    chunks: ['indexedDB'],
    component: (
      <Layout>
        <NoSSR key="indexedDB">{showIndexedDB}</NoSSR>
      </Layout>
    ),
  };
}

export default action;
