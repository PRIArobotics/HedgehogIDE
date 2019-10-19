// @flow

import { ReactElement } from 'react';

export type Block = {|
  blockJson: Object,
  generators: { [string]: (Object) => string },
  toolboxBlocks: { [string]: () => ReactElement },
|};
