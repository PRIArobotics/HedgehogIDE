/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Ide from '../../components/Ide/Ide';
import Layout from '../../components/Layout';

async function action() {
  return {
    title: 'IDE',
    chunks: ['ide'],
    component: (
      <Layout contentFill>
        <Ide />
      </Layout>
    ),
  };
}

export default action;
