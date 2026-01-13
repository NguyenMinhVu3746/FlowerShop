/**
 * CUSTOM HOOKS - useAuth
 * =======================
 * Convenient hook to access auth state
 */

import { useAuthStore } from '../stores';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    isAdmin,
  };
}
