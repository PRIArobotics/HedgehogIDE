import { createMuiTheme } from '@material-ui/core/styles';

import common from '@material-ui/core/colors/common';

const hedgehogGreenLight = '#38b449';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: hedgehogGreenLight,
      contrastText: common.white,
    },
  },
});

export default theme;
