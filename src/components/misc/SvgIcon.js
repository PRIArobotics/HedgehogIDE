// @flow

import React from 'react';
import { withStyles } from '@material-ui/styles';

import Icon from '@material-ui/core/Icon';

type PropTypes = {|
  src: string,
  alt?: string,
  // classes: object,
|};

const styled = withStyles({});

class SvgIcon extends React.Component<PropTypes> {
  render() {
    const { src, alt } = this.props;
    return (
      <Icon>
        <img src={src} alt={alt} />
      </Icon>
    );
  }
}

export default styled(SvgIcon);
