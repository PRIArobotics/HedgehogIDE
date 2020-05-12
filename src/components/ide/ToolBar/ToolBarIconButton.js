// @flow

import * as React from 'react';

import { styled } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';

const StyledIconButton = styled(IconButton)({
  padding: '4px',
});

type Props = {|
  icon: typeof React.Component,
  color: string,
  ...React.ElementConfig<typeof StyledIconButton>,
|};

const ToolBarIconButton = React.forwardRef<Props, StyledIconButton>(
  ({ icon: Icon, color, ...props }: Props, ref: Ref<StyledIconButton>) => (
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
