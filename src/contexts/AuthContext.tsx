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
              name: response.data.username // Use username as name for now
            };
            setUser(authUser);
          } else {
            // Token is invalid, clear storage
            TokenManager.removeToken();
          }
        })
        .catch((error) => {
          console.warn('AuthContext: Token validation failed, but keeping user logged in:', error);
          // Don't clear token on network errors - backend might be starting up
          // Only clear on explicit 401 responses
          if (error.message === 'Unauthorized') {
            TokenManager.removeToken();
          } else {
            // Keep user logged in with stored data during backend startup
            const authUser: AuthUser = {
              username: storedUser.username,
              role: mapBackendRoleToFrontend(storedUser.role || 'ADMIN'),
              name: storedUser.username
            };
            setUser(authUser);
          }
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

  const login = async (mobile: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('AuthContext: Starting login for mobile:', mobile);
      const response = await authApi.login(mobile, password);

      console.log('AuthContext: Login response:', response);

      if (response.success) {
        console.log('AuthContext: Login successful, response.data:', response.data);
        const authUser: AuthUser = {
          username: response.data.username || mobile, // Backend might return mobile as username
          role: mapBackendRoleToFrontend(response.data.role),
          name: (response.data as any).firstName && (response.data as any).lastName
            ? `${(response.data as any).firstName} ${(response.data as any).lastName}`
            : response.data.username || mobile
        };

        console.log('AuthContext: Created authUser:', authUser);
        setUser(authUser);
        return { success: true };
      } else {
        console.log('AuthContext: Login failed, response:', response);
        return { success: false, error: (response as any).error || 'Invalid mobile number or password' };
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

      if (error.message) {
        if (error.message.includes('Invalid mobile number or password') || error.message.includes('Invalid username or password')) {
          errorMessage = 'Invalid mobile number or password';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('Server error')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
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

  const updateProfile = (userData: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    changePassword,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
