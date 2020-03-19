import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './ToolBarItem.scss';

class ToolBarItem extends React.Component<PropTypes, StateTypes> {
  render() {
    return <div className={s.toolBarItem}>{this.props.children}</div>;
  }
}

export default withStyles(s)(ToolBarItem);
