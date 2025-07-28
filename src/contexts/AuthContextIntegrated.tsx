import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, AuthUser, UserRole } from '../types';
import { authApi, TokenManager } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = TokenManager.getUser();
    const token = TokenManager.getToken();
    
    if (storedUser && token) {
      // Verify token is still valid by calling /auth/me
      authApi.getCurrentUser()
        .then(response => {
          if (response.success) {
            const authUser: AuthUser = {
              username: response.data.username,
              role: mapBackendRoleToFrontend(response.data.role),
              name: `${response.data.firstName} ${response.data.lastName}`
            };
            setUser(authUser);
          } else {
            // Token is invalid, clear storage
            TokenManager.removeToken();
          }
        })
        .catch(() => {
          // Token is invalid, clear storage
          TokenManager.removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const mapBackendRoleToFrontend = (backendRole: string): UserRole => {
    switch (backendRole) {
      case 'MASTER':
        return 'master';
      case 'ADMIN':
        return 'admin';
      default:
        return 'admin';
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await authApi.login(username, password);
      
      if (response.success) {
        const authUser: AuthUser = {
          username: (response.data as any).user?.username || response.data.username || username,
          role: mapBackendRoleToFrontend((response.data as any).user?.role || response.data.role),
          name: (response.data as any).user?.firstName && (response.data as any).user?.lastName
            ? `${(response.data as any).user.firstName} ${(response.data as any).user.lastName}`
            : response.data.username || username
        };

        setUser(authUser);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      TokenManager.removeToken();
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authApi.changePassword(oldPassword, newPassword);
      return response.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    changePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
