"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type AuthUser } from "@/lib/api";

const TOKEN_KEY = "foldup_token";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  const setStoredToken = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `foldup_token=${token}; Path=/; Max-Age=${TOKEN_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    document.cookie = "foldup_token=; Path=/; Max-Age=0; SameSite=Lax";
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    setStoredToken(token);

    authApi
      .me(token)
      .then((user) => setState({ user, token, isLoading: false }))
      .catch(() => {
        setStoredToken(null);
        setState({ user: null, token: null, isLoading: false });
      });
  }, [setStoredToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setStoredToken(res.accessToken);
    setState({ user: res.user, token: res.accessToken, isLoading: false });
  }, [setStoredToken]);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await authApi.register({ email, password, name });
      setStoredToken(res.accessToken);
      setState({ user: res.user, token: res.accessToken, isLoading: false });
    },
    [setStoredToken],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setState({ user: null, token: null, isLoading: false });
  }, [setStoredToken]);

  const hasRole = useCallback(
    (role: string) => state.user?.roles.includes(role) ?? false,
    [state.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      isAuthenticated: Boolean(state.user),
      hasRole,
    }),
    [state, login, register, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
