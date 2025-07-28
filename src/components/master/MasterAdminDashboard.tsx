import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sidebar, Button } from '../ui';
import LanguageSelector from '../ui/LanguageSelector';
import StatsCard from '../admin/StatsCard';
import AdminManagement from './AdminManagement';
import UserAgentManagement from './UserAgentManagement';
import TransactionManagement from './TransactionManagement';
import IssueManagement from './IssueManagement';
import ProfileSettings from './ProfileSettings';
import AgentTracking from '../admin/AgentTracking';
import {
  BarChart3,
  Shield,
  Users,
  AlertTriangle,
  LogOut,
  DollarSign,
  Activity,
  TrendingUp,
  UserCheck,
  Sun,
  Moon,
  Vote,
  User,
  MapPin
} from 'lucide-react';

type MasterTab = 'overview' | 'admins' | 'users-agents' | 'transactions' | 'issues' | 'tracking' | 'profile';

const MasterAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { users, agents, administrators } = useData();
  const { toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MasterTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calculate enhanced stats
  const totalAmount = users.filter(u => u.paid).reduce((sum, u) => sum + (u.amount || 0), 0);
  const totalAgents = agents.length; // Total agents instead of just active
  const totalAdmins = administrators.length; // Total sub-admins
  const totalVoters = users.length; // Total voters in system

  const sidebarItems = [
    {
      id: 'overview',
      label: t.navigation.systemOverview,
      icon: <BarChart3 className="w-5 h-5" />,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview'
    },
    {
      id: 'admins',
      label: t.navigation.officerManagement,
      icon: <Shield className="w-5 h-5" />,
      onClick: () => setActiveTab('admins'),
      active: activeTab === 'admins'
    },
    {
      id: 'users-agents',
      label: t.navigation.voterManagement,
      icon: <Users className="w-5 h-5" />,
      onClick: () => setActiveTab('users-agents'),
      active: activeTab === 'users-agents'
    },
    {
      id: 'transactions',
      label: t.navigation.transactionManagement,
      icon: <DollarSign className="w-5 h-5" />,
      onClick: () => setActiveTab('transactions'),
      active: activeTab === 'transactions'
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
      id: 'profile',
      label: 'Profile Settings',
      icon: <User className="w-5 h-5" />,
      onClick: () => setActiveTab('profile'),
      active: activeTab === 'profile'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{t.dashboard.masterAdminTitle}</h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.dashboard.masterAdminSubtitle}</p>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Distribution"
                value={`₹${totalAmount.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6" />}
                color="success"
                trend={{ value: 15, isPositive: true }}
              />
              <StatsCard
                title="Sub-Admins"
                value={totalAdmins}
                icon={<Shield className="w-6 h-6" />}
                color="primary"
              />
              <StatsCard
                title="Election Officers"
                value={totalAgents}
                icon={<UserCheck className="w-6 h-6" />}
                color="info"
                trend={{ value: 5, isPositive: true }}
              />
              <StatsCard
                title="Total Voters"
                value={totalVoters}
                icon={<TrendingUp className="w-6 h-6" />}
                color="warning"
                trend={{ value: 22, isPositive: true }}
              />
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-medium border p-6 transition-colors duration-200`}>
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Health</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Database Status</span>
                    <span className={`px-2 py-1 ${isDark ? 'bg-green-900 text-green-300' : 'bg-success-100 text-success-800'} rounded-full text-sm font-medium`}>
                      ✓ Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>API Services</span>
                    <span className={`px-2 py-1 ${isDark ? 'bg-green-900 text-green-300' : 'bg-success-100 text-success-800'} rounded-full text-sm font-medium`}>
                      ✓ Running
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment Gateway</span>
                    <span className={`px-2 py-1 ${isDark ? 'bg-green-900 text-green-300' : 'bg-success-100 text-success-800'} rounded-full text-sm font-medium`}>
                      ✓ Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Security Status</span>
                    <span className={`px-2 py-1 ${isDark ? 'bg-green-900 text-green-300' : 'bg-success-100 text-success-800'} rounded-full text-sm font-medium`}>
                      ✓ Secure
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-medium border p-6 transition-colors duration-200`}>
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance Metrics</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment Success Rate</span>
                      <span className={`font-medium ${isDark ? 'text-green-400' : 'text-success-600'}`}>98.5%</span>
                    </div>
                    <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                      <div className={`${isDark ? 'bg-green-500' : 'bg-success-600'} h-2 rounded-full`} style={{ width: '98.5%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>System Uptime</span>
                      <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-primary-600'}`}>99.9%</span>
                    </div>
                    <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                      <div className={`${isDark ? 'bg-blue-500' : 'bg-primary-600'} h-2 rounded-full`} style={{ width: '99.9%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Agent Activity</span>
                      <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-info-600'}`}>87%</span>
                    </div>
                    <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                      <div className={`${isDark ? 'bg-purple-500' : 'bg-info-600'} h-2 rounded-full`} style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'admins':
        return <AdminManagement />;
      case 'users-agents':
        return <UserAgentManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'issues':
        return <IssueManagement />;
      case 'tracking':
        return <AgentTracking />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Sidebar */}
      <Sidebar
        title={t.auth.masterAdmin}
        titleIcon={<Vote className="w-6 h-6" />}
        items={sidebarItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        className={`${isDark ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white' : 'bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 text-white'} border-r-0 transition-colors duration-200`}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'} text-white px-6 py-4 shadow-lg transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Vote className="w-6 h-6 text-yellow-300" />
              <h1 className="text-xl font-semibold">
                {sidebarItems.find(item => item.active)?.label || t.dashboard.masterAdminTitle}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                    : 'bg-white/20 hover:bg-white/30 text-gray-700'
                }`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-right">
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-white'}`}>{user?.username}</div>
                <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-100'}`}>{t.auth.masterAdmin}</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
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

export default MasterAdminDashboard;
