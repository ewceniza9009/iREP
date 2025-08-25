import { createContext, useState, useEffect, ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import { LOGIN_MUTATION, LOGOUT_MUTATION } from '../graphql/auth';
import { User, DecodedToken } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [isLoading, setIsLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.id, email: decoded.email, roles: decoded.roles, tenantId: decoded.tenantId });
        } else {
          // Token expired, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        // Invalid token, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
      }
    }
    setIsLoading(false);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    const { data } = await loginMutation({ variables: { loginDto: { email, password } } });
    if (data.login) {
      localStorage.setItem('accessToken', data.login.accessToken);
      localStorage.setItem('refreshToken', data.login.refreshToken);
      setAccessToken(data.login.accessToken);
    }
  };

  const logout = async () => {
    // Although the backend doesn't have a logout resolver yet,
    // calling this won't break anything and prepares for future implementation.
    // You can optionally wrap this in a try/catch if the missing resolver throws an error you want to hide.
    try {
        await logoutMutation();
    } catch (e) {
        console.warn("Logout mutation failed (this may be expected if not implemented on backend):", e);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setAccessToken(null);
  };

  const value = { user, accessToken, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}