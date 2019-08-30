/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../components/Layout';
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
