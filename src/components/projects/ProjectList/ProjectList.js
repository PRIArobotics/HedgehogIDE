// @flow

import React from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProjectList.scss';

type PropTypes = {||};
type StateTypes = {||};

class Console extends React.Component<PropTypes, StateTypes> {
  render() {
    return <div className={s.root} />;
  }
}

export default withStyles(s)(Console);
