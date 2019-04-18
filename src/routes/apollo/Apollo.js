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
import { graphql, compose } from 'react-apollo';
import type { OperationComponent } from 'react-apollo';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// $FlowExpectError
import Button from '@material-ui/core/Button';
// $FlowExpectError
import query from './query.graphql';
// $FlowExpectError
import mutation from './mutation.graphql';
import s from './Apollo.css';

import type { ApolloQuery } from './__generated__/ApolloQuery';
import type { ApolloMutation } from './__generated__/ApolloMutation';

type PropTypes = {|
  apolloQuery: ApolloQuery & {
    refetch: () => Promise<void>,
    loading: boolean,
  },
  apolloMutation: (args?: {}) => Promise<{ data: ApolloMutation }>,
|};

// Note: There is a regression from flow-bin@0.89.0
// which spoils OperationComponent declaration. Be careful.
const enhance: OperationComponent<PropTypes> = compose(
  graphql(query, {
    name: 'apolloQuery',
    // $FlowExpectError
    options: { notifyOnNetworkStatusChange: true },
  }),
  graphql(mutation, {
    name: 'apolloMutation',
  }),
  withStyles(s),
);

type StateTypes = {|
  mutationData: string | null,
|};

class Apollo extends React.Component<PropTypes, StateTypes> {
  constructor(props) {
    super(props);
    this.state = {
      mutationData: null,
    };
  }

  render() {
    const {
      apolloQuery: { refetch, loading, apolloQuery },
      apolloMutation,
    } = this.props;
    const { mutationData } = this.state;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>Apollo feature test</h1>
          <p>
            Query:
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await refetch();
              }}
            >
              Refresh
            </Button>
            {loading ? 'Loading...' : apolloQuery.data}
          </p>
          <p>
            Mutation:
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                const { data } = (await apolloMutation()).data.apolloMutation;
                this.setState({
                  mutationData: data,
                });
              }}
            >
              Refresh
            </Button>
            {mutationData === null ? '(not executed yet)' : mutationData}
          </p>
        </div>
      </div>
    );
  }
}

// $FlowExpectError
export default enhance(Apollo);
