// @flow

import * as React from 'react';

export type Block = {|
  blockJson: Object,
  generators: { [string]: (Object) => string },
  toolboxBlocks: { [string]: () => React.Node },
|};
