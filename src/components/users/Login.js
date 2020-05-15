// @flow

import * as React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import DialogTitle from '@material-ui/core/DialogTitle';
import { DialogActions, DialogContent } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import { ApolloError } from 'apollo-client';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { useAuth } from './AuthProvider';

type LoginProps = {|
  open: boolean,
  onSuccess: () => void | Promise<void>,
  onError: (err: any) => void | Promise<void>,
|};

function Login({ open, onSuccess, onError }: LoginProps) {
  const auth = useAuth();

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
      <DialogTitle>Log In</DialogTitle>
      <form onSubmit={login}>
        <DialogContent>
          {error ? (
            <Alert severity="error">
              <AlertTitle>Login Failed</AlertTitle>
              {error}
            </Alert>
          ) : null}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onError('CANCEL')} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Log In
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default Login;
