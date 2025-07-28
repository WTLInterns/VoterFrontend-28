import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../common/Toast';
import { Table, Button, StatusBadge, Modal, Input, Card } from '../ui';

import type { TableColumn, Administrator } from '../../types';
import { Plus, Edit, Trash2, Shield, ShieldOff, Crown, Eye, RefreshCw } from 'lucide-react';
import { DataUpdateIndicator, LiveDataBadge } from '../common/DataUpdateIndicator';
import { useInstantUpdates } from '../../hooks/useInstantUpdates';

const AdminManagement: React.FC = () => {
  const { administrators, deleteAdmin, blockAdmin, unblockAdmin, updateAdmin, addAdmin, refreshData, loading } = useData();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();

  const [editingAdmin, setEditingAdmin] = useState<Administrator | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: ''
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<Administrator | null>(null);

  // Production-level instant updates with auto-refresh
  const {
    isUpdating,
    lastUpdated,
    manualRefresh,
    forceUpdate,
    markDataUpdated,
    setUpdating
  } = useInstantUpdates({
    refreshData,
    autoRefreshInterval: 30000, // 30 seconds
    enableAutoRefresh: true,
    onRefreshStart: () => console.log('Refreshing administrators data...'),
    onRefreshEnd: () => console.log('Administrators data refreshed'),
    onError: (error) => {
      console.error('Auto-refresh error:', error);
      showError('Failed to refresh data', 'Please try again manually.');
    }
  });

  // Force re-render when administrators data changes
  useEffect(() => {
    markDataUpdated();
  }, [administrators, markDataUpdated]);

  const columns: TableColumn<Administrator>[] = [
    {
      key: 'id',
      label: t.table.adminId,
      sortable: true
    },
    {
      key: 'firstName',
      label: t.table.name,
      render: (_, admin) => `${admin.firstName} ${admin.lastName}`,
      sortable: true
    },
    {
      key: 'mobile',
      label: t.table.mobile,
      sortable: true
    },
    {
      key: 'role',
      label: t.table.role,
      render: (role) => (
        <StatusBadge status={role === 'ADMIN' ? 'info' : 'warning'}>
          {role === 'ADMIN' ? t.table.subAdmin : t.table.supervisor}
        </StatusBadge>
      )
    },
    {
      key: 'status',
      label: t.table.status,
      render: (status) => (
        <StatusBadge status={status}>
          {status.toUpperCase()}
        </StatusBadge>
      )
    },
    {
      key: 'createdAt',
      label: t.table.createdDate,
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleDateString() : '-',
      sortable: true
    },
    {
      key: 'totalPayments',
      label: 'Total Payments Overseen',
      render: (totalPayments) => {
        return totalPayments > 0 ? `₹${totalPayments.toLocaleString()}` : '-';
      },
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, admin) => (
        <div className="flex space-x-1 min-w-[200px]">
          {/* Read/View Button */}
            <Button
              variant="info"
              size="sm"
              onClick={() => setViewingAdmin(admin)}
              title="View Details"
            >
              <Eye className="w-4 h-4 text-blue-700" />
            </Button>

            {/* Update/Edit Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingAdmin(admin);
                setEditPassword(''); // Reset password field
              }}
              title="Edit Admin"
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteAdmin(admin.id)}
              title="Delete Admin"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

          {/* Block/Unblock Button */}
          {admin.status?.toLowerCase() === 'active' ? (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleBlockAdmin(admin.id)}
              title="Block Admin"
            >
              <ShieldOff className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUnblockAdmin(admin.id)}
              title="Unblock Admin"
            >
              <Shield className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleAddAdmin = async () => {
    if (newAdmin.firstName && newAdmin.lastName && newAdmin.mobile && newAdmin.password) {
      setLocalLoading(true);
      setUpdating(true);
      try {
        console.log('Creating sub-admin with data:', newAdmin);

        // Create admin using context function for instant UI update
        const adminData = {
          id: '', // Will be set by backend
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          mobile: newAdmin.mobile,
          password: newAdmin.password,
          role: 'admin' as const,
          status: 'active' as const,
          createdDate: new Date().toISOString(),
          totalPayments: 0,
          createdBy: null
        };

        await addAdmin(adminData);

        console.log('Sub-admin created successfully');
        showSuccess('Sub-admin created successfully!', `Mobile: ${newAdmin.mobile}\nPassword: ${newAdmin.password}\n\nPlease provide these credentials to the sub-admin manually.`);

        // Reset form
        setNewAdmin({
          firstName: '',
          lastName: '',
          mobile: '',
          password: ''
        });

        // Force immediate UI update
        forceUpdate();

      } catch (error) {
        console.error('Error creating sub-admin:', error);
        showError('Failed to create sub-admin', 'Please try again.');
      } finally {
        setLocalLoading(false);
        setUpdating(false);
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleEditAdmin = async () => {
    if (editingAdmin) {
      setLocalLoading(true);
      setUpdating(true);
      try {
        const updateData: any = {
          firstName: editingAdmin.firstName,
          lastName: editingAdmin.lastName,
          mobile: editingAdmin.mobile
        };

        // Only include password if it's provided
        if (editPassword && editPassword.trim() !== '') {
          updateData.password = editPassword;
        }

        // Update admin using context function for instant UI update
        await updateAdmin(editingAdmin.id, updateData);

        console.log('Sub-admin updated successfully');

        if (editPassword && editPassword.trim() !== '') {
          showSuccess('Sub-admin updated successfully!', `New password: ${editPassword}\n\nPlease provide the new password to the sub-admin manually.`);
        } else {
          showSuccess('Sub-admin updated successfully!');
        }

        setEditingAdmin(null);
        setEditPassword('');

        // Force immediate UI update
        forceUpdate();

      } catch (error) {
        console.error('Error updating sub-admin:', error);
        showError('Failed to update sub-admin', 'Please try again.');
      } finally {
        setLocalLoading(false);
        setUpdating(false);
      }
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
      try {
        console.log('Deleting admin:', adminId);
        await deleteAdmin(adminId);
        showSuccess('Administrator deleted successfully!');
      } catch (error) {
        console.error('Error deleting admin:', error);
        showError('Failed to delete administrator', 'Please try again.');
      }
    }
  };

  const handleRecalculatePayments = async () => {
    setLocalLoading(true);
    try {
      const response = await fetch('https://api.expengo.com/api/admins/recalculate-payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Total payments recalculated successfully!');
        // Refresh the page to show updated values
        window.location.reload();
      } else {
        const errorData = await response.text();
        console.error('Recalculation failed:', errorData);
        throw new Error('Failed to recalculate payments');
      }
    } catch (error) {
      console.error('Error recalculating payments:', error);
      showError('Failed to recalculate payments');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBlockAdmin = async (adminId: string) => {
    try {
      console.log('🔒 Blocking admin:', adminId);
      await blockAdmin(adminId);
      console.log('✅ Admin blocked successfully');
      showSuccess('Administrator blocked successfully!');
    } catch (error: any) {
      console.error('❌ Error blocking admin:', error);
      showError('Failed to block administrator', error?.message || 'Please try again.');
    }
  };

  const handleUnblockAdmin = async (adminId: string) => {
    try {
      console.log('🔓 Unblocking admin:', adminId);
      await unblockAdmin(adminId);
      console.log('✅ Admin unblocked successfully');
      showSuccess('Administrator unblocked successfully!');
    } catch (error: any) {
      console.error('❌ Error unblocking admin:', error);
      showError('Failed to unblock administrator', error?.message || 'Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Administrator Management</h1>
        <p className="text-gray-600">Manage system administrators and their permissions</p>
      </div>

      {/* Admin Creation Form */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Create New Administrator</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder={t.forms.firstName}
              value={newAdmin.firstName}
              onChange={(value) => setNewAdmin({ ...newAdmin, firstName: value })}
            />
            <Input
              placeholder={t.forms.lastName}
              value={newAdmin.lastName}
              onChange={(value) => setNewAdmin({ ...newAdmin, lastName: value })}
            />
            <Input
              placeholder={t.forms.mobileNumber}
              type="tel"
              value={newAdmin.mobile}
              onChange={(value) => setNewAdmin({ ...newAdmin, mobile: value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder={t.forms.password}
              type="password"
              value={newAdmin.password}
              onChange={(value) => setNewAdmin({ ...newAdmin, password: value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The mobile number and password you enter will be displayed after creation. Please provide these credentials to the sub-admin manually.
            </p>
          </div>

          <Button
            variant="success"
            onClick={handleAddAdmin}
            disabled={localLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {localLoading ? 'Creating...' : 'Create Sub-Administrator'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleRecalculatePayments}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? 'Recalculating...' : 'Recalculate Payments'}
          </Button>
        </div>
      </Card>

      {/* Administrators Table */}
      <Card>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Administrators ({administrators.length})</h3>
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
              Refresh
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
            data={administrators}
            columns={columns}
            searchable
            searchPlaceholder={t.placeholders.searchAdmins}
          />
        </div>
      </Card>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={!!editingAdmin}
        onClose={() => setEditingAdmin(null)}
        title={t.modals.editAdmin}
      >
        {editingAdmin && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.forms.firstName}
                value={editingAdmin.firstName}
                onChange={(value) => setEditingAdmin({ ...editingAdmin, firstName: value })}
                required
              />
              <Input
                label={t.forms.lastName}
                value={editingAdmin.lastName}
                onChange={(value) => setEditingAdmin({ ...editingAdmin, lastName: value })}
                required
              />
            </div>
            <Input
              label={t.forms.mobileNumber}
              type="tel"
              value={editingAdmin.mobile}
              onChange={(value) => setEditingAdmin({ ...editingAdmin, mobile: value })}
              required
            />
            <Input
              label={t.forms.newPasswordOptional}
              type="password"
              placeholder={t.forms.leaveEmptyToKeepCurrent}
              value={editPassword}
              onChange={(value) => setEditPassword(value)}
            />
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>Mobile:</strong> {editingAdmin.mobile} (can be changed)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Role:</strong> Sub-Administrator (cannot be changed)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Password:</strong> Leave the password field empty to keep the current password, or enter a new password to update it.
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingAdmin(null);
                  setEditPassword('');
                }}
                className="flex-1"
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleEditAdmin}
                className="flex-1"
              >
                {t.buttons.saveChanges}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Admin Modal */}
      <Modal
        isOpen={!!viewingAdmin}
        onClose={() => setViewingAdmin(null)}
        title="Sub-Admin Details"
      >
        {viewingAdmin && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                <p className="text-gray-900">{viewingAdmin.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={viewingAdmin.status}>
                  {viewingAdmin.status.toUpperCase()}
                </StatusBadge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <p className="text-gray-900">{viewingAdmin.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <p className="text-gray-900">{viewingAdmin.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <p className="text-gray-900">{viewingAdmin.mobile}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  {viewingAdmin.role.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Payments</label>
                <p className="text-gray-900">{viewingAdmin.totalPayments || 0}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
              <p className="text-gray-900">{viewingAdmin.createdDate || 'Unknown'}</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setViewingAdmin(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setViewingAdmin(null);
                  setEditingAdmin(viewingAdmin);
                  setEditPassword(''); // Reset password field
                }}
                className="flex-1"
              >
                Edit Admin
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminManagement;
