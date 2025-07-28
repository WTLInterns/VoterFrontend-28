import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppState, User, Agent, Administrator, Transaction, LocationHistory, LoginLog, SystemSettings } from '../types';
import { usersApi, agentsApi, adminsApi, transactionsApi, filesApi, TokenManager } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/Toast';

interface DataContextType extends AppState {
  updateUser: (userId: number, updates: Partial<User>) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<void>;
  addAgent: (agent: Agent) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  blockAgent: (agentId: string) => Promise<void>;
  unblockAgent: (agentId: string) => Promise<void>;
  updateAdmin: (adminId: string, updates: Partial<Administrator>) => Promise<void>;
  addAdmin: (admin: Administrator) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
  blockAdmin: (adminId: string) => Promise<void>;
  unblockAdmin: (adminId: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  loadTransactions: () => Promise<void>;
  addLocationHistory: (entry: LocationHistory) => void;
  addLoginLog: (log: LoginLog) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  processPayment: (userId: number, amount: number, agentUsername: string, location: string) => Promise<void>;
  exportData: (type: 'users' | 'agents' | 'transactions' | 'all') => Promise<void>;
  uploadUsersFile: (file: File) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

// WebSocket instance for real-time location tracking
let locationWebSocket: any | null = null;

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [blockedAgents, setBlockedAgents] = useState<Set<string>>(new Set());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    defaultPaymentAmount: 5000,
    sessionTimeout: 3600000,
    trackingInterval: 5000,
    offlineThreshold: 15000,
    maxFileSize: 10485760,
    supportedFormats: ['xlsx', 'csv', 'pdf'],
    emailNotifications: true,
    autoBackup: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when user logs in or on mount
  useEffect(() => {
    if (user) {
      console.log('DataContext: User logged in, loading data...');
      loadData();
    } else {
      console.log('DataContext: No user, clearing data...');
      // Clear data when user logs out
      setUsers([]);
      setAgents([]);
      setAdministrators([]);
      setTransactions([]);
      setLocationHistory([]);
      setLoginLogs([]);
      setBlockedAgents(new Set());
      setLoading(false);
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (locationWebSocket) {
        locationWebSocket.disconnect();
        locationWebSocket = null;
      }
    };
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data from backend APIs with proper error handling
      console.log('DataContext: Loading data...');

      try {
        // Only load data if user is authenticated
        const token = TokenManager.getToken();
        if (!token) {
          console.log('DataContext: No token found, skipping API calls');
          return;
        }

        console.log('DataContext: Current user:', user);
        console.log('DataContext: User role:', user?.role);
        console.log('DataContext: Is MASTER?', user?.role === 'master');

        // Load data based on user role to avoid permission errors
        const promises = [
          usersApi.getAll(0, 100),
          agentsApi.getAll(),
          transactionsApi.getAll(0, 100)
        ];

        // Only load admin data for MASTER users
        if (user?.role?.toUpperCase() === 'MASTER') {
          console.log('DataContext: Adding administrators API call for MASTER user...');
          promises.push(adminsApi.getAll());
          // Skip location history for now as the endpoint doesn't exist
          // promises.push(locationApi.getAllLocationHistory());
        } else {
          console.log('DataContext: User is not MASTER, skipping administrators API call. User role:', user?.role);
        }

        const responses = await Promise.allSettled(promises);

        const [
          usersResponse,
          agentsResponse,
          transactionsResponse,
          adminsResponse,
          locationHistoryResponse
        ] = responses;

        if (usersResponse.status === 'fulfilled' && usersResponse.value?.success) {
          setUsers(usersResponse.value.data.content || usersResponse.value.data || []);
        } else if (usersResponse.status === 'rejected') {
          console.warn('Failed to load users:', usersResponse.reason);
          // Don't show warning for permission-related errors - this is expected for some roles
          if (!usersResponse.reason?.message?.includes('Access denied') &&
              !usersResponse.reason?.message?.includes('insufficient permissions') &&
              !usersResponse.reason?.message?.includes('forbidden')) {
            showWarning('Failed to load users', 'Some user data may not be available');
          }
        }

        if (agentsResponse.status === 'fulfilled' && agentsResponse.value?.success) {
          setAgents(agentsResponse.value.data || []);
        } else if (agentsResponse.status === 'rejected') {
          console.warn('Failed to load agents:', agentsResponse.reason);
        }

        if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value?.success) {
          setTransactions(transactionsResponse.value.data.content || transactionsResponse.value.data || []);
        } else if (transactionsResponse.status === 'rejected') {
          console.warn('Failed to load transactions:', transactionsResponse.reason);
        }

        // Only process admin and location data for MASTER users
        if (user?.role?.toUpperCase() === 'MASTER') {
          console.log('DataContext: Processing administrators for MASTER user...');
          if (adminsResponse && adminsResponse.status === 'fulfilled' && adminsResponse.value?.success) {
            console.log('DataContext: Administrators loaded successfully:', adminsResponse.value.data);
            setAdministrators(adminsResponse.value.data || []);
          } else if (adminsResponse && adminsResponse.status === 'rejected') {
            console.error('DataContext: Failed to load administrators:', adminsResponse.reason);
          } else {
            console.warn('DataContext: Administrators response was not successful:', adminsResponse);
          }

          if (locationHistoryResponse && locationHistoryResponse.status === 'fulfilled' && locationHistoryResponse.value?.success) {
            setLocationHistory(locationHistoryResponse.value.data || []);
          } else if (locationHistoryResponse && locationHistoryResponse.status === 'rejected') {
            console.warn('Failed to load location history:', locationHistoryResponse.reason);
          }
        }
      } catch (apiError) {
        console.warn('API calls failed, using mock data:', apiError);
      }

    } catch (error) {
      console.error('Error loading data from API:', error);
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const updateUser = async (userId: number, updates: Partial<User>) => {
    // Optimistic update - update UI immediately
    const previousUsers = users;
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ));

    try {
      const response = await usersApi.update(userId, updates);
      if (!response.success) {
        // Rollback on failure
        setUsers(previousUsers);
        throw new Error('Failed to update user');
      }
    } catch (error) {
      // Rollback on error
      setUsers(previousUsers);
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    // Optimistic update - add to UI immediately with temporary ID
    const tempUser = { ...user, id: Date.now() };
    const previousUsers = users;
    setUsers(prev => [...prev, tempUser]);

    try {
      const response = await usersApi.create(user);
      if (response.success && response.data) {
        // Replace temp user with real user from server
        setUsers(prev => prev.map(u =>
          u.id === tempUser.id ? response.data : u
        ));
      } else {
        // Rollback on failure
        setUsers(previousUsers);
        throw new Error('Failed to create user');
      }
    } catch (error) {
      // Rollback on error
      setUsers(previousUsers);
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await usersApi.delete(userId);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const updateAgent = async (agentId: string, updates: Partial<Agent>) => {
    // Optimistic update - update UI immediately
    const previousAgents = agents;
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));

    try {
      const response = await agentsApi.update(agentId, updates);
      if (!response.success) {
        // Rollback on failure
        setAgents(previousAgents);
        throw new Error('Failed to update agent');
      }
    } catch (error) {
      // Rollback on error
      setAgents(previousAgents);
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  const addAgent = async (agent: Agent) => {
    // Optimistic update - add to UI immediately with temporary ID
    const tempAgent = { ...agent, id: agent.id || `temp-${Date.now()}` };
    const previousAgents = agents;
    setAgents(prev => [...prev, tempAgent]);

    try {
      const response = await agentsApi.create(agent);
      if (response.success && response.data) {
        // Replace temp agent with real agent from server
        setAgents(prev => prev.map(a =>
          a.id === tempAgent.id ? response.data : a
        ));
      } else {
        // Rollback on failure
        setAgents(previousAgents);
        throw new Error('Failed to create agent');
      }
    } catch (error) {
      // Rollback on error
      setAgents(previousAgents);
      console.error('Error adding agent:', error);
      throw error;
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      const response = await agentsApi.delete(agentId);
      if (response.success) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  };

  const blockAgent = async (agentId: string) => {
    try {
      const response = await agentsApi.block(agentId);
      if (response.success) {
        setAgents(prev => prev.map(agent =>
          agent.id === agentId ? { ...agent, status: 'blocked' } : agent
        ));
        setBlockedAgents(prev => new Set([...prev, agentId]));
      }
    } catch (error) {
      console.error('Error blocking agent:', error);
      throw error;
    }
  };

  const unblockAgent = async (agentId: string) => {
    try {
      const response = await agentsApi.unblock(agentId);
      if (response.success) {
        setAgents(prev => prev.map(agent =>
          agent.id === agentId ? { ...agent, status: 'active' } : agent
        ));
        setBlockedAgents(prev => {
          const newSet = new Set(prev);
          newSet.delete(agentId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error unblocking agent:', error);
      throw error;
    }
  };

  const updateAdmin = async (adminId: string, updates: Partial<Administrator>) => {
    // Optimistic update - update UI immediately
    const previousAdmins = administrators;
    setAdministrators(prev => prev.map(admin =>
      admin.id === adminId ? { ...admin, ...updates } : admin
    ));

    try {
      const response = await adminsApi.update(adminId, updates);
      if (!response.success) {
        // Rollback on failure
        setAdministrators(previousAdmins);
        throw new Error('Failed to update admin');
      }
    } catch (error) {
      // Rollback on error
      setAdministrators(previousAdmins);
      console.error('Error updating admin:', error);
      throw error;
    }
  };

  const addAdmin = async (admin: Administrator) => {
    // Optimistic update - add to UI immediately with temporary ID
    const tempAdmin = { ...admin, id: admin.id || `temp-${Date.now()}` };
    const previousAdmins = administrators;
    setAdministrators(prev => [...prev, tempAdmin]);

    try {
      const response = await adminsApi.create(admin);
      if (response.success && response.data) {
        // Replace temp admin with real admin from server
        setAdministrators(prev => prev.map(a =>
          a.id === tempAdmin.id ? response.data : a
        ));
      } else {
        // Rollback on failure
        setAdministrators(previousAdmins);
        throw new Error('Failed to create admin');
      }
    } catch (error) {
      // Rollback on error
      setAdministrators(previousAdmins);
      console.error('Error adding admin:', error);
      throw error;
    }
  };

  const deleteAdmin = async (adminId: string) => {
    try {
      const response = await adminsApi.delete(adminId);
      if (response.success) {
        setAdministrators(prev => prev.filter(admin => admin.id !== adminId));
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  };

  const blockAdmin = async (adminId: string) => {
    try {
      const response = await adminsApi.block(adminId);
      if (response.success) {
        setAdministrators(prev => prev.map(admin =>
          admin.id === adminId ? { ...admin, status: 'blocked' } : admin
        ));
      }
    } catch (error) {
      console.error('Error blocking admin:', error);
      throw error;
    }
  };

  const unblockAdmin = async (adminId: string) => {
    try {
      const response = await adminsApi.unblock(adminId);
      if (response.success) {
        setAdministrators(prev => prev.map(admin =>
          admin.id === adminId ? { ...admin, status: 'active' } : admin
        ));
      }
    } catch (error) {
      console.error('Error unblocking admin:', error);
      throw error;
    }
  };

  const processPayment = async (userId: number, amount: number, agentUsername: string, location: string) => {
    try {
      const response = await usersApi.markAsPaid(userId, amount);
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, paid: true, paidDate: new Date().toLocaleDateString(), paidBy: agentUsername, amount }
            : user
        ));

        const transaction: Transaction = {
          id: `TXN-${Date.now()}`,
          userId: userId,
          agentId: agentUsername,
          amount: amount,
          location,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          date: new Date().toISOString(),
          userName: `User ${userId}`,
          // Legacy properties for backward compatibility
          user: `User ${userId}`,
          agent: agentUsername,
          timestamp: new Date().toISOString()
        };
        setTransactions(prev => [transaction, ...prev]);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  const uploadUsersFile = async (file: File) => {
    try {
      const response = await filesApi.uploadUsers(file);
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const exportData = async (type: 'users' | 'agents' | 'transactions' | 'all') => {
    try {
      setLoading(true);

      if (type === 'users' || type === 'all') {
        await filesApi.exportUsers('xlsx');
      }
      if (type === 'agents' || type === 'all') {
        await filesApi.exportAgents('xlsx');
      }
      if (type === 'transactions' || type === 'all') {
        await filesApi.exportTransactions('xlsx');
      }

      // Show success message
      showSuccess(
        `${type === 'all' ? 'All data' : type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`,
        'Excel file has been downloaded to your Downloads folder.'
      );

    } catch (error) {
      console.error('Error exporting data:', error);
      showError('Export failed', 'Failed to export data. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const loadTransactions = async () => {
    try {
      const response = await transactionsApi.getAll(0, 1000); // Load more transactions
      if (response.success) {
        setTransactions(response.data.content || response.data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  };

  const addLocationHistory = (entry: LocationHistory) => {
    setLocationHistory(prev => [entry, ...prev.slice(0, 99)]);
  };

  const addLoginLog = (log: LoginLog) => {
    setLoginLogs(prev => [log, ...prev.slice(0, 99)]);
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...settings }));
  };

  const value: DataContextType = {
    users,
    agents,
    administrators,
    transactions,
    locationHistory,
    loginLogs,
    blockedAgents,
    systemSettings,
    loading,
    error,
    updateUser,
    addUser,
    deleteUser,
    updateAgent,
    addAgent,
    deleteAgent,
    blockAgent,
    unblockAgent,
    updateAdmin,
    addAdmin,
    deleteAdmin,
    blockAdmin,
    unblockAdmin,
    addTransaction,
    loadTransactions,
    addLocationHistory,
    addLoginLog,
    updateSystemSettings,
    processPayment,
    exportData,
    uploadUsersFile,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
