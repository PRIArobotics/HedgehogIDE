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

/**
 * An icon button for the vertical toolbar.
 * This component handles color for disabled buttons correctly.
 */
function ToolBarIconButton({ icon: Icon, color, ...props }: Props, ref: Ref<StyledIconButton>) {
  return (
    <StyledIconButton ref={ref} {...props}>
      <Icon
        style={{
          ...(!props.disabled && color ? { color } : {}),
        }}
      />
    </StyledIconButton>
  );
}

export default React.forwardRef<Props, StyledIconButton>(ToolBarIconButton);
