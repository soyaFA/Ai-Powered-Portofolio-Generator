import { useCallback, useEffect, useState } from 'react';
import { apiClient, clearStoredToken, getStoredToken } from '../services/api';
import type { AuthUser } from '../types/portfolio';

export function useAuth() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(() =>
    Boolean(getStoredToken())
  );

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }
    apiClient
      .getCurrentUser()
      .then(({ user }) => {
        setAuthUser(user);
      })
      .catch(() => {
        clearStoredToken();
        setAuthUser(null);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setAuthUser(null);
  }, []);

  return { authUser, setAuthUser, isCheckingAuth, logout } as const;
}