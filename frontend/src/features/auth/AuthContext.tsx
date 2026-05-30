import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/shared/api/client';
import { UnauthorizedError } from '@/shared/api/errors';
import type { SessionInfo, LoginCredentials } from '@/shared/api/types';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  loading: boolean;
  sessionExpired: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { username: string } }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  sessionExpired: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: { username: action.payload.username },
        loading: false,
        sessionExpired: false,
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SESSION_EXPIRED':
      return { ...initialState, loading: false, sessionExpired: true };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    api
      .get<SessionInfo>('/api/auth/session/')
      .then((data) => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { username: data.user.username } });
      })
      .catch(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(() => {
      api.get<SessionInfo>('/api/auth/session/').catch((error) => {
        if (error instanceof UnauthorizedError) {
          dispatch({ type: 'SESSION_EXPIRED' });
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await api.post<SessionInfo>('/api/auth/login/', credentials);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { username: data.user.username } });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout/');
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
