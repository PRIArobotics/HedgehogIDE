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
import En from './en/Help';
import De from './de/Help';
import Layout from '../../components/layout/Layout';

import { LocaleSelector } from '../../components/locale';
import { type LocaleMap } from '../../translations';

const HELP_COMPONENTS: LocaleMap<React.ComponentType<{}>> = {
  en: En,
  de: De,
};

async function action() {
  return {
    title: 'Help',
    chunks: ['help'],
    component: (
      <Layout>
        <LocaleSelector components={HELP_COMPONENTS} />
      </Layout>
    ),
  };
}

export default action;
