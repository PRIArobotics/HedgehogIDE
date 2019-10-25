// @flow

import * as React from 'react';

declare type __DEV__ = boolean;

declare type RefObject<T> = {
  current: React.ElementRef<T> | null,
};