// @flow

import * as React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { defineMessages, FormattedMessage as M, useIntl } from 'react-intl';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ApolloError } from 'apollo-client';

import commonMessages from '../misc/commonMessages';

import { useAuth } from './AuthProvider';

type LoginProps = {|
  open: boolean,
  onSuccess: () => void | Promise<void>,
  onError: (err: any) => void | Promise<void>,
|};

const messages = {
  ...defineMessages({
    loginFailed: {
      id: 'app.login.failed',
      description: 'Log In Failed Error Message Title',
      defaultMessage: 'Log In Failed',
    },
    username: {
      id: 'app.auth.username',
      description: 'Username',
      defaultMessage: 'Username',
    },
    password: {
      id: 'app.auth.password',
      description: 'Password',
      defaultMessage: 'Password',
    },
  }),
  ...commonMessages,
};

function Login({ open, onSuccess, onError }: LoginProps) {
  const auth = useAuth();
  const intl = useIntl();

  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<string>(null);

  const login = async event => {
    event.preventDefault();
    try {
      await auth.login(username, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        setError(err.message);
      } else {
        throw err;
      }
    } finally {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <Dialog open={open} onClose={() => onError('CANCEL')}>
      <DialogTitle>
        <M {...messages.login} />
      </DialogTitle>
      <form onSubmit={login}>
        <DialogContent>
          {error ? (
            <Alert severity="error">
              <AlertTitle>
                <M {...messages.loginFailed} />
              </AlertTitle>
              {error}
            </Alert>
          ) : null}
          <TextField
            margin="normal"
            required
            fullWidth
            label={intl.formatMessage(messages.username)}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={intl.formatMessage(messages.password)}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onError('CANCEL')} color="secondary">
            <M {...messages.cancel} />
          </Button>
          <Button type="submit" color="primary">
            <M {...messages.login} />
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default Login;
