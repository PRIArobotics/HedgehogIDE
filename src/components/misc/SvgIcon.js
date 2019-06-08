// @flow

import React from 'react';

import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/styles';

type PropTypes = {|
  src: string,
  alt?: string,
  classes: object,
|};

const styled = withStyles({
  icon: {
    verticalAlign: 'top',
  },
});

class SvgIcon extends React.Component<PropTypes> {
  render() {
    const { src, alt, classes } = this.props;
    return (
      <Icon>
        <img className={classes.icon} src={src} alt={alt} />
      </Icon>
    );
  }
}

export default styled(SvgIcon);
