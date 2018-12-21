/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { defineMessages } from 'react-intl';
import Layout from '../../components/Layout';
import Ide from '../../components/Ide/Ide';

const messages = defineMessages({
  title: {
    id: 'ide.title',
    description: 'IDE page title',
    defaultMessage: 'IDE',
  },
});

async function action({ intl }) {
  const title = intl.formatMessage(messages.title);
  return {
    title,
    component: (
      <Layout>
        <Ide />
      </Layout>
    ),
  };
}

export default action;
