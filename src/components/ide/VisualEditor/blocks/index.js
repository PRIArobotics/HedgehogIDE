// @flow

import * as React from 'react';

export type Block = {|
  blockJson: Object,
  generators: { [string]: (Object) => string | [string, number] },
  toolboxBlocks: { [string]: () => React.Node },
|};
