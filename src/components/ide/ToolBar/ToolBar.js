import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import s from './ToolBar.scss';

class ToolBar extends React.Component<PropTypes, StateTypes> {
  render() {
    return <div className={s.toolBar}>{this.props.children}</div>;
  }
}

export default withStyles(s)(ToolBar);
