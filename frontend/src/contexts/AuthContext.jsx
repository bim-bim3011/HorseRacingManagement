import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loginApi, logoutApi } from '../api/authApi';
import { getRolesFromToken } from '../utils/authUtils';

const AuthContext = createContext(null);

const TOKEN_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!accessToken;

  // Derive user roles from JWT scope claim
  const userRoles = useMemo(() => getRolesFromToken(accessToken), [accessToken]);

  // Convenience function to check if user has a specific role
  const checkRole = useCallback((role) => userRoles.includes(role), [userRoles]);

  // Listen for custom events from fetchWithAuth
  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      setAccessToken(e.detail);
    };
    
    const handleAuthLogout = () => {
      setAccessToken(null);
      setError('Session expired. Please login again.');
    };

    window.addEventListener('token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth-logout', handleAuthLogout);

    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  /**
   * Login with username and password.
   * Stores tokens in localStorage and updates state.
   */
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginApi(username, password);
      localStorage.setItem(TOKEN_KEY, result.accessToken);
      setAccessToken(result.accessToken);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set auth state directly from an already-obtained token (e.g. Google OAuth).
   * Does not call any API — the token has already been exchanged on the backend.
   */
  const loginWithToken = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAccessToken(token);
  }, []);

  /**
   * Logout: blacklist token on server, clear localStorage.
   */
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await logoutApi(accessToken);
      }
    } catch {
      // Continue with local logout even if server call fails
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAccessToken(null);
      setError(null);
    }
  }, [accessToken]);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    userRoles,
    hasRole: checkRole,
    login,
    loginWithToken,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
