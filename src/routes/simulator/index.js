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
import Simulator from '../../components/Simulator/Simulator';

const messages = defineMessages({
  title: {
    id: 'simulator.title',
    description: 'Simulator page title',
    defaultMessage: 'Simulator',
  },
});

async function action({ intl }) {
  const title = intl.formatMessage(messages.title);
  return {
    title,
    component: (
      <Layout>
        <Simulator />
      </Layout>
    ),
  };
}

export default action;
