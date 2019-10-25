// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import { graphql, compose } from 'react-apollo';
import type { OperationComponent } from 'react-apollo';
// $FlowExpectError
import Button from '@material-ui/core/Button';
// $FlowExpectError
import query from './query.graphql';
// $FlowExpectError
import mutation from './mutation.graphql';
// $FlowExpectError
import subscription from './subscription.graphql';
import s from './Apollo.css';

import type { ApolloQuery } from './__generated__/ApolloQuery';
import type { ApolloMutation } from './__generated__/ApolloMutation';
import type { ApolloSubscription } from './__generated__/ApolloSubscription';

type PropTypes = {|
  apolloQuery: ApolloQuery & {
    refetch: () => Promise<void>,
    loading: boolean,
  },
  apolloQuery2: ApolloQuery & {
    subscribeToMore: ({}) => void,
    loading: boolean,
  },
  apolloMutation: (args?: {}) => Promise<{ data: ApolloMutation }>,
  apolloSubscription: ApolloSubscription & {
    loading: boolean,
  },
|};

// Note: There is a regression from flow-bin@0.89.0
// which spoils OperationComponent declaration. Be careful.
const enhance: OperationComponent<PropTypes> = compose(
  graphql(query, {
    name: 'apolloQuery',
    // $FlowExpectError
    options: { notifyOnNetworkStatusChange: true },
  }),
  graphql(query, {
    name: 'apolloQuery2',
    // $FlowExpectError
    options: { notifyOnNetworkStatusChange: true },
  }),
  graphql(mutation, {
    name: 'apolloMutation',
  }),
  graphql(subscription, {
    name: 'apolloSubscription',
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

  componentDidMount() {
    const {
      apolloQuery2: { subscribeToMore },
    } = this.props;

    subscribeToMore({
      document: subscription,
      variables: {},
      updateQuery: (prev: ApolloQuery, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const { data }: { data: ApolloSubscription } = subscriptionData;

        return {
          apolloQuery: data.apolloSubscription,
        };
      },
    });
  }

  render() {
    const {
      apolloQuery: { refetch, loading, apolloQuery },
      apolloQuery2: { loading: loading2, apolloQuery: apolloQuery2 },
      apolloMutation,
      apolloSubscription: { loading: loading3, apolloSubscription },
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
            Query with refresh:
            {loading2 ? 'Loading...' : apolloQuery2.data}
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
          <p>
            Subscription:
            {loading3 ? 'Loading...' : apolloSubscription.data}
          </p>
        </div>
      </div>
    );
  }
}

// $FlowExpectError
export default enhance(Apollo);
