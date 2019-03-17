/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import React from 'react';
import { graphql } from 'react-apollo';
import type { OperationComponent } from 'react-apollo';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// $FlowExpectError
import query from './query.graphql';
import s from './Apollo.css';

import type { ApolloQuery } from './__generated__/ApolloQuery';

// Note: There is a regression from flow-bin@0.89.0
// which spoils OperationComponent declaration. Be careful.
const withQuery: OperationComponent<ApolloQuery> = graphql(query);

const Home = withQuery(props => {
  const {
    data: { loading, apolloQuery },
  } = props;

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>Apollo feature test</h1>
        {loading ? 'Loading...' : <p>{apolloQuery.data}</p>}
      </div>
    </div>
  );
});

export default withStyles(s)(Home);
