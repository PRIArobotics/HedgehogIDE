// @flow
/* eslint-disable import/prefer-default-export */

import * as React from 'react';

export async function setState<Props, State>(
  component: React.Component<Props, State>,
  partialState: ?$Shape<State> | ((State, Props) => ?$Shape<State>),
): Promise<void> {
  await new Promise(resolve => component.setState(partialState, resolve));
}
