import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppState, User, Agent, Administrator, Transaction, LocationHistory, LoginLog, SystemSettings } from '../types';
import { usersApi, agentsApi, adminsApi, transactionsApi, locationApi, filesApi } from '../services/api';

interface DataContextType extends AppState {
  updateUser: (userId: number, updates: Partial<User>) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<void>;
  addAgent: (agent: Agent) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  blockAgent: (agentId: string) => Promise<void>;
  unblockAgent: (agentId: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
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
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [blockedAgents] = useState<Set<string>>(new Set());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    defaultPaymentAmount: 5000,
    sessionTimeout: 3600000,
    trackingInterval: 5000,
    offlineThreshold: 15000,
    maxFileSize: 10485760,
    supportedFormats: ['csv', 'xlsx', 'pdf'],
    emailNotifications: true,
    autoBackup: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount
  useEffect(() => {
    loadData();

    // Cleanup WebSocket on unmount
    return () => {
      if (locationWebSocket) {
        locationWebSocket.disconnect();
        locationWebSocket = null;
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        usersResponse,
        agentsResponse,
        adminsResponse,
        transactionsResponse,
        locationResponse
      ] = await Promise.allSettled([
        usersApi.getAll(0, 100), // Get first 100 users
        agentsApi.getAll(),
        adminsApi.getAll(),
        transactionsApi.getAll(0, 100), // Get first 100 transactions
        locationApi.getAllAgents()
      ]);

      // Handle users data
      if (usersResponse.status === 'fulfilled' && usersResponse.value.success) {
        setUsers(usersResponse.value.data.content || usersResponse.value.data);
      }

      // Handle agents data
      if (agentsResponse.status === 'fulfilled' && agentsResponse.value.success) {
        setAgents(agentsResponse.value.data);
      }

      // Handle administrators data
      if (adminsResponse.status === 'fulfilled' && adminsResponse.value.success) {
        setAdministrators(adminsResponse.value.data);
      }

      // Handle transactions data
      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        setTransactions(transactionsResponse.value.data.content || transactionsResponse.value.data);
      }

      // Handle location data
      if (locationResponse.status === 'fulfilled' && locationResponse.value.success) {
        const locationData = locationResponse.value.data.map((agent: any) => ({
          id: Date.now() + Math.random(),
          agentId: agent.agentId,
          agentName: agent.agentName,
          latitude: agent.latitude,
          longitude: agent.longitude,
          location: agent.location,
          timestamp: agent.lastUpdated,
          action: 'Location Update'
        }));
        setLocationHistory(locationData);
      }

      // Initialize WebSocket for real-time location updates
      if (!locationWebSocket) {
        // locationWebSocket = new LocationWebSocket(); // Temporarily disabled
        locationWebSocket.connect(
          (locationUpdate: any) => {
            // Handle real-time location updates
            setLocationHistory(prev => [
              {
                id: Date.now() + Math.random(),
                agentId: locationUpdate.agentId,
                agentName: locationUpdate.agentName,
                latitude: locationUpdate.latitude,
                longitude: locationUpdate.longitude,
                location: locationUpdate.location,
                timestamp: new Date().toISOString(),
                action: 'Location Update'
              },
              ...prev.slice(0, 99) // Keep only last 100 entries
            ]);

            // Update agent location in agents list
            setAgents(prev => prev.map(agent => 
              agent.id === locationUpdate.agentId 
                ? { ...agent, latitude: locationUpdate.latitude, longitude: locationUpdate.longitude, lastLocation: locationUpdate.location }
                : agent
            ));
          },
          (agentOnline: any) => {
            console.log('Agent came online:', agentOnline);
          },
          (agentOffline: any) => {
            console.log('Agent went offline:', agentOffline);
          }
        );
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
    try {
      const response = await usersApi.update(userId, updates);
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const response = await usersApi.create(user);
      if (response.success) {
        setUsers(prev => [...prev, response.data]);
      }
    } catch (error) {
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
    try {
      const response = await agentsApi.update(agentId, updates);
      if (response.success) {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, ...updates } : agent
        ));
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  const addAgent = async (agent: Agent) => {
    try {
      const response = await agentsApi.create(agent);
      if (response.success) {
        setAgents(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
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
      }
    } catch (error) {
      console.error('Error unblocking agent:', error);
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

        // Add transaction record
        const transaction: Transaction = {
          id: `TXN-${Date.now()}`,
          userId,
          agentId: agentUsername,
          amount,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          date: new Date().toISOString(),
          userName: `User ${userId}`,
          location,
          // Legacy properties for backward compatibility
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
        // Refresh users data after successful upload
        await refreshData();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const exportData = async (type: 'users' | 'agents' | 'transactions' | 'all') => {
    try {
      if (type === 'users' || type === 'all') {
        await filesApi.exportUsers();
      }
      if (type === 'transactions' || type === 'all') {
        await filesApi.exportTransactions();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  // Simple implementations for compatibility
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
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
    addTransaction,
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
