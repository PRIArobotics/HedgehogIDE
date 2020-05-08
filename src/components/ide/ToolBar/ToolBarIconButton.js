import * as React from 'react';

import { styled } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';

const StyledIconButton = styled(IconButton)({
  padding: '4px',
});

const ToolBarIconButton = React.forwardRef(
  ({ icon: Icon, color, ...props }, ref) => (
    <StyledIconButton ref={ref} {...props}>
      <Icon
        style={{
          ...(!props.disabled && color ? { color } : {}),
        }}
      />
    </StyledIconButton>
  ),
);

export default ToolBarIconButton;
