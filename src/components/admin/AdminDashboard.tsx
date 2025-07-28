import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sidebar, Button } from '../ui';
import LanguageSelector from '../ui/LanguageSelector';
import StatsCard from './StatsCard';
import VoterManagement from './UserManagement';
import AgentManagement from './AgentManagement';
import SubAdminIssueManagement from './IssueManagement';
import DataManagement from './DataManagement';
import AgentTracking from './AgentTracking';
import {
  Shield,
  BarChart3,
  Users,
  UserCheck,
  Database,
  AlertTriangle,
  LogOut,
  DollarSign,
  Activity,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';

type AdminTab = 'overview' | 'voters' | 'agents' | 'issues' | 'tracking' | 'data';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { users, agents, transactions } = useData();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calculate stats
  const totalAmount = users.filter(u => u.paid).reduce((sum, u) => sum + (u.amount || 0), 0);
  const totalAgents = agents.length; // Total agents instead of just active ones

  const sidebarItems = [
    {
      id: 'overview',
      label: t.navigation.overview,
      icon: <BarChart3 className="w-5 h-5" />,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview'
    },
    {
      id: 'voters',
      label: t.navigation.voterManagement,
      icon: <Users className="w-5 h-5" />,
      onClick: () => setActiveTab('voters'),
      active: activeTab === 'voters'
    },
    {
      id: 'agents',
      label: t.navigation.electionOfficers,
      icon: <UserCheck className="w-5 h-5" />,
      onClick: () => setActiveTab('agents'),
      active: activeTab === 'agents'
    },
    {
      id: 'issues',
      label: t.sections.issueManagement,
      icon: <AlertTriangle className="w-5 h-5" />,
      onClick: () => setActiveTab('issues'),
      active: activeTab === 'issues'
    },
    {
      id: 'tracking',
      label: t.navigation.agentTracking,
      icon: <MapPin className="w-5 h-5" />,
      onClick: () => setActiveTab('tracking'),
      active: activeTab === 'tracking'
    },
    {
      id: 'data',
      label: t.navigation.dataManagement,
      icon: <Database className="w-5 h-5" />,
      onClick: () => setActiveTab('data'),
      active: activeTab === 'data'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{t.dashboard.title}</h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.dashboard.subtitle}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title={t.dashboard.totalDistribution}
                value={`₹${totalAmount.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6" />}
                color="success"
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title={t.dashboard.totalVoters}
                value={users.length}
                icon={<Users className="w-6 h-6" />}
                color="primary"
              />
              <StatsCard
                title={t.dashboard.totalAgents}
                value={totalAgents}
                icon={<UserCheck className="w-6 h-6" />}
                color="info"
              />
            </div>

            {/* Recent Activity */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-medium border p-6 transition-colors duration-200`}>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.system.recentActivity}</h3>
              </div>
              
              {transactions.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.system.noRegistrationsYet}
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(-5).reverse().map((transaction, index) => {
                    // Find user and agent names
                    const user = users.find(u => u.id === transaction.userId);
                    const agent = agents.find(a => a.id === transaction.agentId);

                    const userName = user ? `${user.firstName} ${user.lastName}` : `User ${transaction.userId}`;
                    const agentName = agent ? `${agent.firstName} ${agent.lastName}` : transaction.agentId;

                    // Format date and time
                    const date = new Date(transaction.createdAt);
                    const formattedDate = date.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });
                    const formattedTime = date.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <div key={index} className={`flex items-center justify-between p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg transition-colors duration-200`}>
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.dashboard.distributedBy} {agentName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-success-600 dark:text-success-400">₹{transaction.amount?.toLocaleString()}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div>{formattedDate}</div>
                            <div>{formattedTime}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case 'voters':
        return <VoterManagement />;
      case 'agents':
        return <AgentManagement />;
      case 'issues':
        return <SubAdminIssueManagement />;
      case 'tracking':
        return <AgentTracking />;
      case 'data':
        return <DataManagement />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Sidebar */}
      <Sidebar
        title={t.appName}
        titleIcon={<Shield className="w-6 h-6" />}
        items={sidebarItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        className={`${isDark ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white' : 'bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 text-white'} border-r-0 transition-colors duration-200`}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sidebarItems.find(item => item.active)?.label || t.navigation.dashboard}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors duration-200`}
                title={t.dashboard.switchToMode.replace('{mode}', isDark ? 'light' : 'dark')}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-right">
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.username}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.auth.admin}</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.common.logout}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
