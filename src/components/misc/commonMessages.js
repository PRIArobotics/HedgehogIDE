import { defineMessages } from 'react-intl';

const messages = defineMessages({
  ok: {
    id: 'app.dialog.ok',
    description: 'text for the OK button in dialogs',
    defaultMessage: 'OK',
  },
  cancel: {
    id: 'app.dialog.cancel',
    description: 'text for the Cancel button in dialogs',
    defaultMessage: 'Cancel',
  },
  login: {
    id: 'app.login',
    description: 'Log In Title',
    defaultMessage: 'Log In',
  },
  logout: {
    id: 'app.logout',
    description: 'Log Out Title',
    defaultMessage: 'Log Out',
  },
});
export default messages;
