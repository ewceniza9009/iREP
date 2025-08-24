import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginDto: LoginDto!) {
    login(loginDto: $loginDto) {
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;