/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import * as React from 'react';
import Contest from './Contest';
import Layout from '../../components/layout/Layout/Layout';

async function action() {
  return {
    title: 'Contest',
    chunks: ['contest'],
    component: (
      <Layout>
        <Contest />
      </Layout>
    ),
  };
}

export default action;
