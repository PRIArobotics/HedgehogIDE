// @flow

import * as React from 'react';

import NoSSR from '../../misc/NoSSR';

export type Props = {|
  // eslint-disable-next-line react/no-unused-prop-types
  children?: React.Node,
  // eslint-disable-next-line react/no-unused-prop-types
  width: string,
  // eslint-disable-next-line react/no-unused-prop-types
  height: string,
|};

function showReadOnlyBlockly(props: Props) {
  return async () => {
    const { default: ReadOnlyBlockly } = await import('./ReadOnlyBlockly');

    return <ReadOnlyBlockly {...props} />;
  };
}

function Wrapper(props: Props) {
  return <NoSSR>{showReadOnlyBlockly(props)}</NoSSR>;
}

export default Wrapper;
