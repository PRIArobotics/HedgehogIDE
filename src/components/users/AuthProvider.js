// @flow

import * as React from 'react';

import gql from 'graphql-tag';

import { makeMutation } from '../misc/hooks';

import {
  type Login,
  type LoginVariables,
  type Login_login as AuthData,
} from './__generated__/Login';

const useLoginMutation = makeMutation<Login, LoginVariables>(gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      token
    }
  }
`);

type Auth = {|
  authData: AuthData | null,
  login(username: string, password: string): Promise<AuthData>,
  logout(): void,
|};

export const AuthContext = React.createContext<Auth>({
  authData: null,
  login() {
    throw new Error('login not specified');
  },
  logout() {
    throw new Error('logout not specified');
  },
});

type AuthProviderPropTypes = {|
  children: React.Node,
|};

export function AuthProvider({ children }: AuthProviderPropTypes) {
  const [performLogin, _loginResponse] = useLoginMutation();
  const [authData, setAuthData] = React.useState<AuthData | null>(null);

  const login = async (username: string, password: string) => {
    const result = await performLogin({ variables: { username, password } });

    // we're not passing `ignoreResults`, so there will be a result
    // eslint-disable-next-line no-throw-literal
    if (!result.data) throw 'unreachable';

    const data = result.data.login;
    setAuthData(data);
    localStorage.setItem('auth', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem('auth');
  };

  const recoverSession = () => {
    const auth = localStorage.getItem('auth');
    setAuthData(auth ? JSON.parse(auth) : null);
  };

  React.useEffect(() => recoverSession(), []);

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): Auth {
  return React.useContext(AuthContext);
}
