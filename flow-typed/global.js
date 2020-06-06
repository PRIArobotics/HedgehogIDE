// @flow

import * as React from 'react';

declare var __DEV__: boolean;

declare type RefObject<T> = {
  current: React.ElementRef<T> | null,
};

declare type Ref<Instance> =
  | { current: Instance | null }
  | (Instance | null) => mixed;
