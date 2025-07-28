import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Table, Button, StatusBadge, Modal, Input, Card, Pagination } from '../ui';
import { filesApi, usersApi } from '../../services/api';
import type { TableColumn, User } from '../../types';
import { Upload, Download, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import AdvancedSearchModal, { SearchFilters } from './AdvancedSearchModal';
import VidhansabhaDropdown from '../common/VidhansabhaDropdown';
import { DataUpdateIndicator, LiveDataBadge } from '../common/DataUpdateIndicator';
import { useInstantUpdates } from '../../hooks/useInstantUpdates';
import { ValidationUtils } from '../../utils/errorHandler';

const UserManagement: React.FC = () => {
  const { users: voters, agents, updateUser: updateVoter, addUser: addVoter, deleteUser: deleteVoter, exportData, refreshData, loading } = useData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState<User | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Production-level instant updates with auto-refresh
  const {
    isUpdating,
    lastUpdated,
    manualRefresh,
    markDataUpdated
  } = useInstantUpdates({
    refreshData,
    autoRefreshInterval: 30000, // 30 seconds
    enableAutoRefresh: true,
    onRefreshStart: () => console.log('Refreshing users data...'),
    onRefreshEnd: () => console.log('Users data refreshed'),
    onError: (error) => {
      console.error('Auto-refresh error:', error);
      showError('Failed to refresh data', 'Please try again manually.');
    }
  });

  // Force re-render when users data changes
  useEffect(() => {
    markDataUpdated();
  }, [voters, markDataUpdated]);

  // Check if current user is master admin
  // const isMasterAdmin = user?.role === 'master'; // Removed since Generate Sample Data was removed
  const [newVoter, setNewVoter] = useState({
    firstName: '',
    lastName: '',
    age: 18,
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    vidhansabhaNo: '',
    vibhaghKramank: '',
    amount: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  // Load initial data on component mount
  useEffect(() => {
    loadUsers(0);
  }, [pageSize]); // Reload when page size changes

  const columns: TableColumn<User>[] = [
    {
      key: 'firstName',
      label: t.table.name,
      render: (_, voter) => `${voter.firstName} ${voter.lastName}`,
      sortable: true
    },
    {
      key: 'age',
      label: t.table.age,
      render: (age) => age || '-',
      sortable: true
    },
    {
      key: 'gender',
      label: t.table.gender,
      render: (gender) => gender || '-',
      sortable: true
    },
    {
      key: 'vidhansabhaNo',
      label: t.table.vidhansabhaNo,
      render: (vidhansabhaNo) => vidhansabhaNo || '-',
      sortable: true
    },
    {
      key: 'vibhaghKramank',
      label: t.table.vibhaghKramank,
      render: (vibhaghKramank) => vibhaghKramank || '-',
      sortable: true
    },
    {
      key: 'paid',
      label: t.table.distributionStatus,
      render: (paid) => (
        <StatusBadge status={paid ? 'paid' : 'pending'}>
          {paid ? t.table.distributed : t.table.pending}
        </StatusBadge>
      )
    },
    {
      key: 'amount',
      label: t.userManagement.amountDistributed,
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    {
      key: 'paidDate',
      label: t.userManagement.distributionDateTime,
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
          <span className="text-gray-400 dark:text-gray-500 italic">{t.userManagement.notDistributed}</span>
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
            {paidBy}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'actions',
      label: t.table.actions,
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditingVoter(user)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteVoter(user.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleAddVoter = () => {
    // Use comprehensive validation
    const validation = ValidationUtils.validateVoterData({
      firstName: newVoter.firstName,
      lastName: newVoter.lastName,
      age: newVoter.age,
      vidhansabhaNo: newVoter.vidhansabhaNo,
      vibhaghKramank: newVoter.vibhaghKramank
    });

    if (!validation.isValid) {
      showError('Validation Error', validation.errors.join(', '));
      return;
    }

    addVoter({
      ...newVoter,
      paid: false,
      paidDate: null,
      paidBy: null,
      createdBy: null
    });

    setNewVoter({
      firstName: '',
      lastName: '',
      age: 18,
      gender: 'MALE',
      vidhansabhaNo: '',
      vibhaghKramank: '',
      amount: 0
    });
    setShowAddModal(false);
  };

  const handleEditVoter = () => {
    if (editingVoter) {
      // Use comprehensive validation for update
      const validation = ValidationUtils.validateVoterData({
        firstName: editingVoter.firstName,
        lastName: editingVoter.lastName,
        age: editingVoter.age || 18,
        vidhansabhaNo: editingVoter.vidhansabhaNo || '',
        vibhaghKramank: editingVoter.vibhaghKramank || ''
      });

      if (!validation.isValid) {
        showError('Validation Error', validation.errors.join(', '));
        return;
      }

      updateVoter(editingVoter.id, editingVoter);
      setEditingVoter(null);
    }
  };

  // Load paginated users
  const loadUsers = async (page: number = currentPage) => {
    try {
      setIsLoadingPage(true);
      const response = await usersApi.getAll({ page, size: pageSize });

      if (response.success && response.data) {
        const pageData = response.data;
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
        setCurrentPage(page);

        // Update the data context with current page data
        // Note: This assumes your data context can handle paginated data
        console.log('Loaded page data:', pageData);
      } else {
        showError('Failed to load users');
      }
    } catch (error: any) {
      showError('Failed to load users: ' + error.message);
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleAdvancedSearch = async (filters: SearchFilters) => {
    try {
      setIsSearching(true);

      // Call the advanced search API using the service
      const searchFilters = {
        ...filters,
        paid: filters.paid === null ? undefined : filters.paid,
        page: 0,
        size: pageSize // Use current page size instead of fixed 100
      };
      const response = await usersApi.advancedSearch(searchFilters);

      if (response.success) {
        const pageData = response.data;
        const voters = pageData.content || [];
        setSearchResults(voters);
        setHasSearched(true);
        setShowAdvancedSearch(false);

        // Update pagination info for search results
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
        setCurrentPage(0);

        showSuccess(`Found ${pageData.totalElements || voters.length} voters`);
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to search voters');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setCurrentPage(0);
    loadUsers(0); // Reload fresh data
    showSuccess('Search cleared successfully!');
  };

  const downloadTemplate = async () => {
    try {
      // Call backend API to get Excel template
      const response = await fetch('https://api.expengo.com/api/files/template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'voter_data_template.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Excel template downloaded successfully');
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showError('Failed to download template');
    }
  };

  const handleDeleteVoter = (voterId: number) => {
    if (confirm(t.userManagement.deleteConfirmation)) {
      deleteVoter(voterId);
    }
  };

  // Removed generateSampleData function - all data should come from backend

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // First validate the file
      const validationResponse = await filesApi.validateFile(file);

      // ✅ FIXED: Check success and warnings properly (as per fix report)
      const hasErrors = !validationResponse.success ||
                       (validationResponse.data?.warnings && validationResponse.data.warnings.length > 0);

      if (hasErrors) {
        const warnings = validationResponse.data?.warnings || [t.userManagement.validationFailed];
        showError(t.userManagement.validationFailed, warnings.join('\n'));
        setIsUploading(false);
        return;
      }

      console.log('=== FRONTEND: Validation passed, starting upload ===');

      // If validation passes, upload the file
      const uploadResponse = await filesApi.uploadUsers(file);

      if (uploadResponse.success) {
        const result = uploadResponse.data;
        const message = `File uploaded successfully!

Total Records: ${result.totalRecords}
Successful: ${result.successfulRecords}
Failed: ${result.failedRecords}

${result.errors && result.errors.length > 0 ?
  'Errors:\n' + result.errors.slice(0, 5).join('\n') +
  (result.errors.length > 5 ? '\n... and more' : '') : ''}`;

        showSuccess(t.userManagement.fileUploadSuccess, message);
      } else {
        showError(t.userManagement.fileUploadFailed, uploadResponse.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Error uploading file', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.userManagement.title}</h1>
        <p className="text-gray-600">{t.userManagement.subtitle}</p>
      </div>

      {/* Upload Section */}
      <Card>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Upload className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">{t.userManagement.uploadVoterData}</h4>
          </div>
          <p className="text-gray-600">{t.userManagement.dragDropExcel}</p>
          <p className="text-sm text-gray-500">
            {t.userManagement.importVoterData}
          </p>
          <p className="text-sm text-gray-500">
            {t.userManagement.amountNote}
          </p>
          <div className="flex justify-center space-x-3">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={isUploading}
            />
            <Button
              variant="primary"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? t.userManagement.uploading : t.userManagement.chooseFile}
            </Button>
            {/* Removed Generate Sample Data button - all data should come from backend */}
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              disabled={isUploading}
            >
              <Download className="w-4 h-4 mr-2" />
              {t.userManagement.downloadTemplate}
            </Button>
          </div>
        </div>
      </Card>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-semibold text-gray-900">
            {hasSearched ? `${t.userManagement.searchResults} (${searchResults.length} ${t.userManagement.found})` : `${t.userManagement.voterDatabase} (${voters.length} ${t.userManagement.total})`}
          </h4>
          {hasSearched && (
            <Button variant="secondary" size="sm" onClick={handleClearSearch}>
              {t.userManagement.clearSearch}
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setShowAdvancedSearch(true)}>
            <Search className="w-4 h-4 mr-2" />
            {t.userManagement.advancedSearch}
          </Button>
          <Button variant="secondary" onClick={() => exportData('users')}>
            <Download className="w-4 h-4 mr-2" />
            {t.userManagement.exportData}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t.userManagement.addVoter}
          </Button>
        </div>
      </div>

      {/* Voters Table */}
      <Card>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">{t.userManagement.voters} ({hasSearched ? searchResults.length : voters.length})</h3>
            <LiveDataBadge isLive={!loading && !isUpdating} />
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={manualRefresh}
              disabled={loading || isUpdating}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${(loading || isUpdating) ? 'animate-spin' : ''}`} />
              {t.common.refresh}
            </Button>
            <DataUpdateIndicator
              isUpdating={loading || isUpdating}
              lastUpdated={lastUpdated}
              className="text-sm"
            />
          </div>
        </div>
        <div className="p-6">
          <Table
            data={hasSearched ? searchResults : voters}
            columns={columns}
            searchable={!hasSearched}
            searchPlaceholder={t.placeholders.searchVoters}
          />
        </div>
      </Card>

      {/* Pagination Controls */}
      {totalElements > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(page) => {
            if (hasSearched) {
              // For search results, we need to re-run search with new page
              // This would require modifying handleAdvancedSearch to accept page parameter
              console.log('Search pagination not fully implemented yet');
            } else {
              loadUsers(page);
            }
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
            if (hasSearched) {
              // Re-run search with new page size
              console.log('Search page size change not fully implemented yet');
            } else {
              loadUsers(0);
            }
          }}
          isLoading={isLoadingPage || isSearching}
        />
      )}

      {/* Add Voter Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t.userManagement.addNewVoter}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.forms.firstName}
              value={newVoter.firstName}
              onChange={(value) => setNewVoter({ ...newVoter, firstName: value })}
              required
            />
            <Input
              label={t.forms.lastName}
              value={newVoter.lastName}
              onChange={(value) => setNewVoter({ ...newVoter, lastName: value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.forms.age}
              type="number"
              value={newVoter.age?.toString() || '18'}
              onChange={(value) => setNewVoter({ ...newVoter, age: parseInt(value) || 18 })}
              required
              min="18"
              max="120"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.forms.gender}</label>
              <select
                value={newVoter.gender}
                onChange={(e) => setNewVoter({ ...newVoter, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="MALE">{t.userManagement.male}</option>
                <option value="FEMALE">{t.userManagement.female}</option>
                <option value="OTHER">{t.userManagement.other}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.userManagement.vidhansabhaConstituency} <span className="text-red-500">*</span>
            </label>
            <VidhansabhaDropdown
              value={newVoter.vidhansabhaNo}
              onChange={(value) => setNewVoter({...newVoter, vidhansabhaNo: value})}
              placeholder={t.userManagement.selectVidhansabha}
            />
          </div>
          <Input
            label={t.userManagement.vibhaghKramank}
            value={newVoter.vibhaghKramank}
            onChange={(value) => {
              // Only allow numbers
              const numericValue = value.replace(/[^\d]/g, '');
              setNewVoter({ ...newVoter, vibhaghKramank: numericValue });
            }}
            placeholder={t.userManagement.divisionSectionNumber}
            required
          />
          <div className="text-sm text-gray-500">
            <p>{t.userManagement.amountNote}</p>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddVoter}
              className="flex-1"
            >
              {t.userManagement.addVoter}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Voter Modal */}
      <Modal
        isOpen={!!editingVoter}
        onClose={() => setEditingVoter(null)}
        title={t.userManagement.editVoter}
      >
        {editingVoter && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.forms.firstName}
                value={editingVoter.firstName}
                onChange={(value) => setEditingVoter({ ...editingVoter, firstName: value })}
                required
              />
              <Input
                label={t.forms.lastName}
                value={editingVoter.lastName}
                onChange={(value) => setEditingVoter({ ...editingVoter, lastName: value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.forms.age}
                type="number"
                value={editingVoter.age?.toString() || '18'}
                onChange={(value) => setEditingVoter({ ...editingVoter, age: parseInt(value) || 18 })}
                required
                min="18"
                max="120"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.forms.gender}</label>
                <select
                  value={editingVoter.gender || 'MALE'}
                  onChange={(e) => setEditingVoter({ ...editingVoter, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="MALE">{t.userManagement.male}</option>
                  <option value="FEMALE">{t.userManagement.female}</option>
                  <option value="OTHER">{t.userManagement.other}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.userManagement.vidhansabhaConstituency} <span className="text-red-500">*</span>
              </label>
              <VidhansabhaDropdown
                value={editingVoter.vidhansabhaNo || ''}
                onChange={(value) => setEditingVoter({...editingVoter, vidhansabhaNo: value})}
                placeholder={t.userManagement.selectVidhansabha}
              />
            </div>
            <Input
              label={t.userManagement.vibhaghKramank}
              value={editingVoter.vibhaghKramank || ''}
              onChange={(value) => {
                // Only allow numbers
                const numericValue = value.replace(/[^\d]/g, '');
                setEditingVoter({ ...editingVoter, vibhaghKramank: numericValue });
              }}
              required
              placeholder={t.userManagement.divisionSectionNumber}
            />
            {/* Amount field - only visible for agents, not sub-admins */}
            {user?.role === 'agent' && (
              <Input
                label={t.userManagement.amountDistributedRupees}
                type="number"
                value={editingVoter.amount?.toString() || '0'}
                onChange={(value) => setEditingVoter({ ...editingVoter, amount: parseInt(value) || 0 })}
                required
              />
            )}
            {user?.role !== 'agent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.userManagement.amountDistributedRupees}
                </label>
                <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
                  <span className="text-gray-600">₹{editingVoter.amount || 0}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.userManagement.amountCanOnlyBeSetByAgents}
                  </p>
                </div>
              </div>
            )}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setEditingVoter(null)}
                className="flex-1"
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleEditVoter}
                className="flex-1"
              >
                {t.userManagement.saveChanges}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        onClear={() => {
          setSearchResults([]);
          setHasSearched(false);
          setCurrentPage(0);
          loadUsers(0);
        }}
        isLoading={isSearching}
      />
    </div>
  );
};

export default UserManagement;
