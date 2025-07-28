import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Table, Button, StatusBadge, Card } from '../ui';
import type { TableColumn, User, Agent } from '../../types';
import { Users, UserCheck, Download, Shield, UserPlus, UserCog, Search, Filter } from 'lucide-react';
import AdvancedSearchModal, { SearchFilters } from '../admin/AdvancedSearchModal';

type ViewMode = 'voters' | 'agents';

const UserAgentManagement: React.FC = () => {
  const { users: voters, agents, administrators, exportData } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('voters');
  const [selectedCreator, setSelectedCreator] = useState<string>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);



  const voterColumns: TableColumn<User>[] = [
    { key: 'id', label: t.table.id, sortable: true },
    { key: 'firstName', label: t.table.name, render: (_, voter) => `${voter.firstName} ${voter.lastName}`, sortable: true },
    { key: 'age', label: t.table.age, render: (age) => age || '-', sortable: true },
    { key: 'gender', label: t.table.gender, render: (gender) => gender || '-', sortable: true },
    { key: 'vidhansabhaNo', label: t.table.vidhansabhaNo, render: (vidhansabhaNo) => vidhansabhaNo || '-', sortable: true },
    { key: 'vibhaghKramank', label: t.table.vibhaghKramank, render: (vibhaghKramank) => vibhaghKramank || '-', sortable: true },
    { key: 'paid', label: t.table.distributionStatus, render: (paid) => <StatusBadge status={paid ? 'paid' : 'pending'}>{paid ? t.table.distributed : t.table.pending}</StatusBadge> },
    { key: 'amount', label: 'Amount Distributed', render: (amount) => `₹${amount?.toLocaleString() || 0}` },
    {
      key: 'paidDate',
      label: 'Distribution Date & Time',
      render: (date) => {
        if (!date) return '-';
        try {
          const dateObj = new Date(date);
          const formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          const formattedTime = dateObj.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">{formattedDate}</div>
              <div className="text-gray-500 dark:text-gray-400">{formattedTime}</div>
            </div>
          );
        } catch (error) {
          return date;
        }
      },
      sortable: true
    },
    {
      key: 'paidBy',
      label: t.table.distributedBy,
      render: (paidBy) => {
        if (!paidBy) return (
          <span className="text-gray-400 dark:text-gray-500 italic">Not distributed</span>
        );

        // Try to find agent by ID first, then by mobile number
        let agent = agents.find(a => a.id === paidBy);
        if (!agent) {
          agent = agents.find(a => a.mobile === paidBy);
        }



        if (agent) {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {agent.firstName} {agent.lastName}
            </span>
          );
        }

        return (
          <span className="text-orange-600 dark:text-orange-400 text-sm">
            Agent ID: {paidBy}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (createdBy) => {
        if (!createdBy) {
          return (
            <span className="text-gray-500 dark:text-gray-400 italic">System</span>
          );
        }

        const admin = administrators.find(a => a.mobile === createdBy);

        if (admin) {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {admin.firstName} {admin.lastName}
            </span>
          );
        }

        return (
          <span className="text-orange-600 dark:text-orange-400 text-sm">
            {createdBy}
          </span>
        );
      },
      sortable: true
    }
  ];

  const agentColumns: TableColumn<Agent>[] = [
    { key: 'id', label: t.table.agentId, sortable: true },
    { key: 'firstName', label: t.table.name, render: (_, agent) => `${agent.firstName} ${agent.lastName}`, sortable: true },
    { key: 'mobile', label: t.table.mobile, sortable: true },
    { key: 'username', label: t.table.username, sortable: true },
    { key: 'status', label: t.table.status, render: (status) => <StatusBadge status={status}>{status.toUpperCase()}</StatusBadge> },

    {
      key: 'paymentsToday',
      label: t.table.todaysDistribution,
      render: (paymentsToday) => paymentsToday > 0 ? `₹${paymentsToday.toLocaleString()}` : '₹0',
      sortable: true
    },
    {
      key: 'totalPayments',
      label: t.table.totalDistribution,
      render: (totalPayments) => totalPayments > 0 ? `₹${totalPayments.toLocaleString()}` : '₹0',
      sortable: true
    },
    {
      key: 'createdBy',
      label: t.table.createdBy,
      render: (createdBy) => {
        if (!createdBy) return t.table.master;
        const admin = administrators.find(a => a.mobile === createdBy);
        return admin ? `${admin.firstName} ${admin.lastName}` : createdBy;
      },
      sortable: true
    }
  ];

  // Calculate creation statistics
  const getCreationStats = () => {
    if (viewMode === 'voters') {
      const votersByCreator = voters.reduce((acc, voter) => {
        const creator = voter.createdBy || 'System';
        acc[creator] = (acc[creator] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return votersByCreator;
    } else {
      const agentsByCreator = agents.reduce((acc, agent) => {
        const creator = agent.createdBy || 'Master';
        acc[creator] = (acc[creator] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return agentsByCreator;
    }
  };

  const creationStats = getCreationStats();

  // Filter data based on selected creator and search results
  const filteredData = () => {
    let baseData: (User | Agent)[];

    // Determine base data set
    if (hasSearched && viewMode === 'voters') {
      baseData = searchResults;
    } else {
      baseData = viewMode === 'voters' ? voters : agents;
    }

    // Apply creator filter
    if (selectedCreator === 'all') {
      return baseData;
    }

    // Filter by selected creator
    return baseData.filter(item => {
      const createdBy = item.createdBy || (viewMode === 'voters' ? 'System' : 'Master');
      return createdBy === selectedCreator;
    });
  };

  // Get unique creators for filter dropdown
  const getCreatorOptions = () => {
    const creators = Object.keys(creationStats);

    // Map creator names to display names
    const creatorOptions = creators.map(creator => {
      // Find admin name for mobile numbers
      const admin = administrators.find(a => a.mobile === creator);
      const displayName = admin ? `${admin.firstName} ${admin.lastName}` : creator;

      return {
        value: creator,
        label: `${displayName} (${creationStats[creator]})`
      };
    });

    return [
      { value: 'all', label: `All Creators (${(viewMode === 'voters' ? voters : agents).length})` },
      ...creatorOptions
    ];
  };

  // Reset filter when view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    console.log(`🔄 Switching view mode to: ${mode}`);
    setViewMode(mode);
    setSelectedCreator('all');
    setHasSearched(false);
    setSearchResults([]);
  };

  // Handle creator filter change
  const handleCreatorFilterChange = (creator: string) => {
    console.log(`🔍 Filtering by creator: ${creator}`);
    setSelectedCreator(creator);

    // Log current data for debugging
    const currentData = viewMode === 'voters' ? voters : agents;
    console.log(`📊 Total ${viewMode}: ${currentData.length}`);

    if (creator !== 'all') {
      const filtered = currentData.filter(item => {
        const createdBy = item.createdBy || (viewMode === 'voters' ? 'System' : 'Master');
        return createdBy === creator;
      });
      console.log(`📊 Filtered ${viewMode}: ${filtered.length}`);
    }
  };

  // Enhanced advanced search with flexible matching
  const handleAdvancedSearch = (filters: SearchFilters) => {
    console.log('🔍 Master Admin Advanced Search with filters:', filters);

    // Flexible search - always uses contains mode
    let filtered = [...voters];

    if (filters.firstName) {
      filtered = filtered.filter(user => {
        const firstName = user.firstName?.toLowerCase() || '';
        const searchTerm = filters.firstName!.toLowerCase();
        return firstName.includes(searchTerm);
      });
    }

    if (filters.lastName) {
      filtered = filtered.filter(user => {
        const lastName = user.lastName?.toLowerCase() || '';
        const searchTerm = filters.lastName!.toLowerCase();
        return lastName.includes(searchTerm);
      });
    }

    if (filters.gender) {
      filtered = filtered.filter(user => user.gender === filters.gender);
    }

    if (filters.vidhansabhaNo) {
      filtered = filtered.filter(user => {
        const vidhansabha = user.vidhansabhaNo || '';
        const searchTerm = filters.vidhansabhaNo!;
        return vidhansabha.includes(searchTerm);
      });
    }

    if (filters.vibhaghKramank) {
      filtered = filtered.filter(user => {
        const vibhagh = user.vibhaghKramank || '';
        const searchTerm = filters.vibhaghKramank!;
        return vibhagh.includes(searchTerm);
      });
    }

    if (filters.paid !== null && filters.paid !== undefined) {
      filtered = filtered.filter(user => user.paid === filters.paid);
    }

    setSearchResults(filtered);
    setHasSearched(true);
    setShowAdvancedSearch(false);

    console.log(`✅ Master Admin Search completed: ${filtered.length} results found`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Voters & Agents Management</h1>
        <p className="text-gray-600 dark:text-gray-300">Comprehensive view of all voters and field agents</p>
      </div>

      {/* View Toggle */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'voters' ? 'primary' : 'secondary'}
              onClick={() => handleViewModeChange('voters')}
            >
              <Users className="w-4 h-4 mr-2" />
              Voters ({voters.length})
            </Button>
            <Button
              variant={viewMode === 'agents' ? 'primary' : 'secondary'}
              onClick={() => handleViewModeChange('agents')}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Agents ({agents.length})
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {viewMode === 'voters' && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowAdvancedSearch(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Advanced Search
                </Button>
                {hasSearched && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setHasSearched(false);
                      setSearchResults([]);
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Search
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              onClick={() => exportData(viewMode === 'voters' ? 'users' : 'agents')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export {viewMode === 'voters' ? 'Voters' : 'Agents'} (.xlsx)
            </Button>
            <Button
              variant="info"
              onClick={() => exportData('all')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Export All Data (.xlsx)
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {viewMode === 'voters' ? (
          <>
            <Card className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{voters.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Voters</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{voters.filter(v => v.paid).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Money Distributed</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{voters.filter(v => !v.paid).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Distribution</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{voters.filter(v => v.paid).reduce((sum, v) => sum + (v.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Distributed</div>
            </Card>
          </>
        ) : (
          <>
            <Card className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{agents.filter(a => a.status === 'active').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{agents.filter(a => a.status === 'blocked').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Blocked Agents</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {agents.reduce((sum, a) => sum + a.totalPayments, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.userManagement.totalPayments}</div>
            </Card>
          </>
        )}
      </div>



      {/* Creation Statistics */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          {viewMode === 'voters' ? (
            <UserPlus className="w-5 h-5 text-blue-600" />
          ) : (
            <UserCog className="w-5 h-5 text-purple-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {viewMode === 'voters' ? 'Voters Created By Agent' : 'Agents Created By Sub-Admin'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(creationStats).map(([creator, count]) => (
            <div key={creator} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {viewMode === 'voters' ? 'Agent' : 'Sub-Admin'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={creator}>
                    {creator}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {viewMode === 'voters' ? 'users' : 'agents'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(creationStats).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-lg font-medium">{viewMode === 'voters' ? t.sections.noVotersFound : t.sections.noAgentsFound}</div>
            <div className="text-sm">
              {viewMode === 'voters'
                ? t.sections.noUsersCreatedByAgents
                : t.sections.noAgentsCreatedBySubAdmins
              }
            </div>
          </div>
        )}
      </Card>

      {/* Data Table */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {viewMode === 'voters' ?
                (hasSearched ? `${t.sections.voterSearchResults} (${searchResults.length} found)` : t.sections.voterDatabase) :
                t.sections.agentDatabase
              }
            </h3>

            {/* Creator Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Creator:</label>
              <select
                value={selectedCreator}
                onChange={(e) => handleCreatorFilterChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {getCreatorOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {viewMode === 'voters' ? (
            <Table
              data={filteredData() as User[]}
              columns={voterColumns}
              searchable={!hasSearched}
              searchPlaceholder="Search voters..."
            />
          ) : (
            <Table
              data={filteredData() as Agent[]}
              columns={agentColumns}
              searchable
              searchPlaceholder="Search agents..."
            />
          )}
        </div>
      </Card>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        onClear={() => {
          setSearchResults([]);
          setHasSearched(false);
        }}
      />
    </div>
  );
};

export default UserAgentManagement;
