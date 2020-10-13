// @flow

import * as React from 'react';

import NoSSR from '../../misc/NoSSR';

type Props = {||};

function showReadOnlyBlockly(props: Props) {
  return async () => {
    const { default: ReadOnlyBlockly } = await import('./ReadOnlyBlockly');

    return <ReadOnlyBlockly {...props} />;
  };
}

function Wrapper(props: Props) {
  return (
    <NoSSR>{showReadOnlyBlockly(props)}</NoSSR>
  );
}

export default Wrapper;
