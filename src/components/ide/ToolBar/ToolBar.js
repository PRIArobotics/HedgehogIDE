// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ToolBar.scss';

type Props = {|
  children: React.Node,
|};

/**
 * A vertical toolbar for displaying controls in IDE editors,
 * such as for running or terminating a program.
 */
function ToolBar({ children }: Props) {
  useStyles(s);
  return <div className={s.toolBar}>{children}</div>;
}

export default ToolBar;
