import * as React from 'react';

import { styled } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';

const ColoredIconButton = styled(({ color, ...other }) => (
  <IconButton {...other} />
))({
  color: props => props.color,
  padding: '4px',
});

export default ColoredIconButton;
