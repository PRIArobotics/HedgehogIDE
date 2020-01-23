// @flow
/* eslint-disable import/prefer-default-export */

import * as React from 'react';

export function setState<Props, State>(
  component: React.Component<Props, State>,
  partialState: ?$Shape<State> | ((State, Props) => ?$Shape<State>),
): Promise<void> {
  return new Promise(resolve => component.setState(partialState, resolve));
}
