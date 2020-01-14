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
import Help from './Help';
import Layout from '../../components/layout/Layout';

async function action() {
  return {
    title: 'Help',
    chunks: ['help'],
    component: (
      <Layout>
        <Help />
      </Layout>
    ),
  };
}

export default action;
