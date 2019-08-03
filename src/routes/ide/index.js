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
  const showIde = async () => {
    const { default: Ide } = await import('../../components/Ide');

    return <Ide />;
  };
  return {
    title: 'IDE',
    chunks: ['ide'],
    component: (
      <Layout contentFill>
        <NoSSR>{showIde}</NoSSR>
      </Layout>
    ),
  };
}

export default action;
