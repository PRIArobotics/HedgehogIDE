// @flow

import * as React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const AuthContext = React.createContext();

type AuthData = {|
  id: string,
  username: string,
  token: string,
|};

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      token
    }
  }
`;

function AuthProvider(props) {
  const [performLogin, _loginResponse] = useMutation(LOGIN);
  const [authData, setAuthData] = React.useState<AuthData>({});

  const login = async (username: string, password: string) => {
    const data = (await performLogin({ variables: { username, password } }))
      .data.login;
    setAuthData(data);
    localStorage.setItem('auth', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem('auth');
  };

  const recoverSession = () => {
    setAuthData(JSON.parse(localStorage.getItem('auth') || null));
  };

  React.useEffect(() => recoverSession(), []);

  return (
    <AuthContext.Provider
      value={{ authData, login, logout }}
      {...props}
    />
  );
}

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
