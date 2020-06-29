// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ToolBarItem.scss';

type Props = {|
  children: React.Node,
|};

/**
 * An item for the vertical toolbar.
 * This component adjusts the margins for the vertical layout.
 */
function ToolBarItem({ children }: Props) {
  useStyles(s);
  return <div className={s.toolBarItem}>{children}</div>;
}

export default ToolBarItem;
