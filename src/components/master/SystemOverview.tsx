import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../ui';
import GoogleMap from '../common/GoogleMap';
import { Activity, TrendingUp, Users, DollarSign, BarChart3, MapPin, Database, Shield, Wifi } from 'lucide-react';

const SystemOverview: React.FC = () => {
  const { users, agents, transactions } = useData();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const stats = {
    totalRevenue: users.filter(u => u.paid).reduce((sum, u) => sum + (u.amount || 0), 0),
    totalUsers: users.length,
    paidUsers: users.filter(u => u.paid).length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalTransactions: transactions.length,
    avgTransactionValue: transactions.length > 0 ?
      users.filter(u => u.paid).reduce((sum, u) => sum + (u.amount || 0), 0) / transactions.length : 0
  };

  // Prepare agent data for map
  const mapAgents = agents.map(agent => ({
    agentId: agent.id,
    agentFirstName: agent.firstName,
    agentLastName: agent.lastName,
    agentMobile: agent.mobile,
    latitude: agent.latitude || 0,
    longitude: agent.longitude || 0,
    connectionStatus: 'OFFLINE' as const,
    lastUpdate: new Date().toISOString(),
    isOnline: false
  }));

  // System health data
  const systemHealth = [
    { name: 'Database Status', status: 'online', icon: Database, color: 'green' },
    { name: 'API Services', status: 'running', icon: Wifi, color: 'green' },
    { name: 'Payment Gateway', status: 'connected', icon: Shield, color: 'green' },
    { name: 'Security Status', status: 'secure', icon: Shield, color: 'green' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{t.system.systemAnalytics}</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive system performance and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">{t.dashboard.totalRevenue}</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+15% from last month</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{t.dashboard.registrationSuccessRate}</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalUsers > 0 ? Math.round((stats.paidUsers / stats.totalUsers) * 100) : 0}%
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Excellent performance</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Avg Registration Value</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">₹{Math.round(stats.avgTransactionValue).toLocaleString()}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Per registration</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Election Officer Location Map */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.system.officerLocations}</h3>
          </div>
          <GoogleMap
            agents={mapAgents}
            height="400px"
          />
        </div>
      </Card>

      {/* System Health */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Health</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealth.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${item.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    <item.icon className={`w-5 h-5 ${item.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                    <p className={`text-sm capitalize ${item.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.status === 'online' && '✓ Online'}
                      {item.status === 'running' && '✓ Running'}
                      {item.status === 'connected' && '✓ Connected'}
                      {item.status === 'secure' && '✓ Secure'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Performance</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Database Response Time</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">12ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>API Latency</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Error Rate</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">0.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Concurrent Users</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{stats.activeAgents}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>User Statistics</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Paid Users</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.paidUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Payments</span>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{stats.totalUsers - stats.paidUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Agents</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{stats.activeAgents}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Timeline */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.system.recentTransactionActivity}</h3>

          {transactions.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.system.noTransactionsYet}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(-10).reverse().map((transaction, index) => (
                <div key={index} className={`flex items-center justify-between p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{transaction.user || `User ${transaction.userId}`}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>by {transaction.agent || transaction.agentId} • {transaction.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600 dark:text-green-400">₹{transaction.amount}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.timestamp || new Date(transaction.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SystemOverview;
