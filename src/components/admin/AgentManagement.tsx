import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../common/Toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { extractErrorMessage, formatErrorForToast, ValidationUtils } from '../../utils/errorHandler';
import { agentsApi } from '../../services/api';
import { Table, Button, StatusBadge, Modal, Input, Card } from '../ui';
import GoogleMap from '../ui/GoogleMap';

import type { TableColumn, Agent } from '../../types';
import { Plus, Edit, Trash2, Shield, ShieldOff, Activity, Eye, MapPin, RefreshCw } from 'lucide-react';
import { DataUpdateIndicator, LiveDataBadge } from '../common/DataUpdateIndicator';
import { useInstantUpdates } from '../../hooks/useInstantUpdates';

const AgentManagement: React.FC = () => {
  const { agents, transactions, deleteAgent, blockAgent, unblockAgent, updateAgent, addAgent, refreshData, loading } = useData();
  const { showSuccess, showError, showInfo } = useToast();
  const { t } = useLanguage();


  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [viewingLocation, setViewingLocation] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: ''
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);

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
    onRefreshStart: () => console.log('Refreshing agents data...'),
    onRefreshEnd: () => console.log('Agents data refreshed'),
    onError: (error) => {
      console.error('Auto-refresh error:', error);
      showError('Failed to refresh data', 'Please try again manually.');
    }
  });

  // Force re-render when agents data changes
  useEffect(() => {
    markDataUpdated();
  }, [agents, markDataUpdated]);

  const columns: TableColumn<Agent>[] = [
    {
      key: 'id',
      label: t.table.agentId,
      sortable: true
    },
    {
      key: 'firstName',
      label: t.table.name,
      render: (_, agent) => `${agent.firstName} ${agent.lastName}`,
      sortable: true
    },
    {
      key: 'mobile',
      label: t.table.mobile,
      sortable: true
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
      key: 'interfaceStatus',
      label: t.table.interface,
      render: (interfaceStatus) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          interfaceStatus === 1
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {interfaceStatus === 1 ? t.table.moneyDistribution : t.table.issueReporting}
        </span>
      )
    },

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
      key: 'actions',
      label: t.table.actions,
      render: (_, agent) => (
        <div className="flex space-x-1 min-w-[200px]">
          {/* Read/View Button */}
            <Button
              variant="info"
              size="sm"
              onClick={() => handleViewAgent(agent)}
              title={t.actions.viewDetails}
            >
              <Eye className="w-4 h-4 text-blue-700" />
            </Button>

            {/* Update/Edit Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingAgent(agent);
                setEditPassword(''); // Reset password field
              }}
              title={t.actions.editAgent}
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteAgent(agent.id)}
              title={t.actions.deleteAgent}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

          {/* Additional Actions */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => viewAgentActivity(agent.id)}
            title={t.agentManagement.viewActivity}
          >
            <Activity className="w-4 h-4" />
          </Button>

          {/* Block/Unblock Button */}
          {agent.status?.toLowerCase() === 'active' ? (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleBlockAgent(agent.id)}
              title={t.agentManagement.blockAgent}
            >
              <ShieldOff className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUnblockAgent(agent.id)}
              title={t.agentManagement.unblockAgent}
            >
              <Shield className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Use centralized phone number validation

  const handleAddAgent = async () => {
    // Validate phone number using centralized validation
    const phoneError = ValidationUtils.validateMobileNumber(newAgent.mobile);
    if (phoneError) {
      showError(t.actions.validationError, phoneError);
      return;
    }

    // Check for duplicate phone number
    const existingAgent = agents.find(agent => agent.mobile === newAgent.mobile.trim());
    if (existingAgent) {
      showError(t.actions.validationError, 'An agent with this phone number already exists');
      return;
    }

    if (newAgent.firstName && newAgent.lastName && newAgent.mobile && newAgent.password) {
      setLocalLoading(true);
      setUpdating(true);
      try {
        console.log('Creating agent with data:', newAgent);

        // Create agent using context function for instant UI update
        const agentData = {
          id: '', // Will be set by backend
          firstName: newAgent.firstName,
          lastName: newAgent.lastName,
          mobile: newAgent.mobile,
          password: newAgent.password,
          status: 'active' as const,
          interfaceStatus: 2, // Default to Issue Reporting
          paymentsToday: 0,
          totalPayments: 0,
          latitude: 0,
          longitude: 0,
          lastLocation: '',
          createdBy: null
        };

        await addAgent(agentData);

        console.log('Agent created successfully');
        showSuccess(t.agentManagement.agentCreatedSuccessfully, `Mobile: ${newAgent.mobile}\nPassword: ${newAgent.password}\n\n${t.agentManagement.credentialsNote}`);

        // Reset form
        setNewAgent({
          firstName: '',
          lastName: '',
          mobile: '',
          password: ''
        });

      } catch (error: any) {
        console.error('Error creating agent:', error);

        // Use improved error handling
        const errorInfo = extractErrorMessage(error);
        const toastError = formatErrorForToast(error);

        showError(toastError.title, errorInfo.message);

        // Force immediate UI update
        forceUpdate();

      } finally {
        setLocalLoading(false);
        setUpdating(false);
      }
    } else {
      showError(t.actions.missingInformation, t.actions.fillAllRequiredFields);
    }
  };

  const handleEditAgent = async () => {
    if (editingAgent) {
      // Validate phone number using centralized validation
      const phoneError = ValidationUtils.validateMobileNumber(editingAgent.mobile);
      if (phoneError) {
        showError(t.actions.validationError, phoneError);
        return;
      }

      // Check for duplicate phone number (excluding current agent)
      const existingAgent = agents.find(agent =>
        agent.mobile === editingAgent.mobile.trim() && agent.id !== editingAgent.id
      );
      if (existingAgent) {
        showError(t.actions.validationError, 'An agent with this phone number already exists');
        return;
      }

      setLocalLoading(true);
      setUpdating(true);
      try {
        // Prepare basic agent update data (without interfaceStatus)
        const updateData: any = {
          firstName: editingAgent.firstName,
          lastName: editingAgent.lastName,
          mobile: editingAgent.mobile
        };

        // Only include password if it's provided
        if (editPassword && editPassword.trim() !== '') {
          updateData.password = editPassword;
        }

        // Update basic agent info using context function for instant UI update
        await updateAgent(editingAgent.id, updateData);

        // Separately update interface status using the specific endpoint
        if (editingAgent.interfaceStatus !== undefined) {
          console.log('🔄 Updating interface status to:', editingAgent.interfaceStatus);
          const interfaceResponse = await agentsApi.updateInterfaceStatus(editingAgent.id, editingAgent.interfaceStatus);

          if (!interfaceResponse.success) {
            throw new Error('Failed to update interface status: ' + interfaceResponse.message);
          }

          console.log('✅ Interface status updated successfully');

          // Refresh data to get the updated interface status
          await refreshData();
        }

        console.log('Agent updated successfully');

        if (editPassword && editPassword.trim() !== '') {
          showSuccess(t.agentManagement.agentUpdatedSuccessfully, t.agentManagement.newPasswordNote(editPassword));
        } else {
          showSuccess(t.agentManagement.agentUpdatedSuccessfully);
        }

        setEditingAgent(null);
        setEditPassword('');

        // Force immediate UI update
        forceUpdate();

      } catch (error: any) {
        console.error('Error updating agent:', error);

        // Use improved error handling
        const errorInfo = extractErrorMessage(error);
        const toastError = formatErrorForToast(error);

        showError(toastError.title, errorInfo.message);
      } finally {
        setLocalLoading(false);
        setUpdating(false);
      }
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm(t.agentManagement.deleteConfirmation)) {
      try {
        console.log('Deleting agent:', agentId);
        await deleteAgent(agentId);
        showSuccess(t.agentManagement.agentDeletedSuccessfully);
      } catch (error) {
        console.error('Error deleting agent:', error);
        showError(t.agentManagement.failedToDeleteAgent, 'Please try again.');
      }
    }
  };

  const viewAgentActivity = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    const agentTransactions = transactions.filter(t =>
      (t.agent && t.agent.includes(agent?.username || agentId)) ||
      t.agentId === agentId
    );

    const message = agentTransactions.length > 0 ?
      `Recent transactions:\n${agentTransactions.slice(-5).map(t =>
        `${t.timestamp || new Date(t.createdAt).toLocaleString()}: ${t.user || `User ${t.userId}`}`
      ).join('\n')}` :
      t.agentManagement.noTransactionsFound;

    showInfo(t.agentManagement.viewActivity, message);
  };

  // Handler functions for CRUD operations
  const handleViewAgent = (agent: Agent) => {
    setViewingAgent(agent);
  };



  const handleBlockAgent = async (agentId: string) => {
    try {
      console.log('🔒 Blocking agent:', agentId);
      await blockAgent(agentId);
      console.log('✅ Agent blocked successfully');
      showSuccess(t.agentManagement.agentBlockedSuccessfully);
    } catch (error: any) {
      console.error('❌ Error blocking agent:', error);
      showError(t.agentManagement.failedToBlockAgent, error?.message || 'Please try again.');
    }
  };

  const handleUnblockAgent = async (agentId: string) => {
    try {
      console.log('🔓 Unblocking agent:', agentId);
      await unblockAgent(agentId);
      console.log('✅ Agent unblocked successfully');
      showSuccess(t.agentManagement.agentUnblockedSuccessfully);
    } catch (error: any) {
      console.error('❌ Error unblocking agent:', error);
      showError(t.agentManagement.failedToUnblockAgent, error?.message || 'Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.agentManagement.title}</h1>
        <p className="text-gray-600">{t.agentManagement.subtitle}</p>
      </div>

      {/* Add Agent Form */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">{t.agentManagement.addNewAgent}</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={t.forms.firstName}
              value={newAgent.firstName}
              onChange={(value) => setNewAgent({ ...newAgent, firstName: value })}
            />
            <Input
              placeholder={t.forms.lastName}
              value={newAgent.lastName}
              onChange={(value) => setNewAgent({ ...newAgent, lastName: value })}
            />
            <Input
              placeholder={t.forms.mobileNumber}
              value={newAgent.mobile}
              onChange={(value) => {
                // Only allow numbers and limit to 10 digits
                const numericValue = value.replace(/[^\d]/g, '').slice(0, 10);
                setNewAgent({ ...newAgent, mobile: numericValue });
              }}
            />
            <Input
              placeholder={t.forms.password}
              type="password"
              value={newAgent.password}
              onChange={(value) => setNewAgent({ ...newAgent, password: value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> {t.agentManagement.credentialsNote}
            </p>
          </div>

          <Button
            variant="success"
            onClick={handleAddAgent}
            disabled={localLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {localLoading ? t.agentManagement.creating : t.agentManagement.createAgent}
          </Button>
        </div>
      </Card>

      {/* Agents Table */}
      <Card>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">{t.table.agents} ({agents.length})</h3>
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
            data={agents}
            columns={columns}
            searchable
            searchPlaceholder={t.placeholders.searchAgents}
          />
        </div>
      </Card>

      {/* Edit Agent Modal */}
      <Modal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        title={t.modals.editAgent}
      >
        {editingAgent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.forms.firstName}
                value={editingAgent.firstName}
                onChange={(value) => setEditingAgent({ ...editingAgent, firstName: value })}
                required
              />
              <Input
                label={t.forms.lastName}
                value={editingAgent.lastName}
                onChange={(value) => setEditingAgent({ ...editingAgent, lastName: value })}
                required
              />
            </div>
            <Input
              label={t.forms.mobileNumber}
              value={editingAgent.mobile}
              onChange={(value) => setEditingAgent({ ...editingAgent, mobile: value })}
              required
            />
            <Input
              label={t.forms.newPasswordOptional}
              type="password"
              placeholder={t.forms.leaveEmptyToKeepCurrent}
              value={editPassword}
              onChange={(value) => setEditPassword(value)}
            />

            {/* Interface Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.forms.interfaceStatus}
              </label>
              <select
                value={editingAgent.interfaceStatus || 2}
                onChange={(e) => setEditingAgent({ ...editingAgent, interfaceStatus: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>{t.forms.moneyDistributionInterface}</option>
                <option value={2}>{t.forms.issueReportingInterface}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t.forms.controlsWhichInterface}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>{t.forms.mobile}:</strong> {editingAgent.mobile} ({t.forms.canBeChanged})
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>{t.forms.lastLocation}:</strong> {editingAgent.lastLocation || t.forms.unknown}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>{t.forms.password}:</strong> {t.forms.leaveEmptyToKeepCurrent}
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingAgent(null);
                  setEditPassword('');
                }}
                className="flex-1"
              >
                {t.forms.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleEditAgent}
                className="flex-1"
              >
                {t.forms.saveChanges}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Agent Modal */}
      <Modal
        isOpen={!!viewingAgent}
        onClose={() => setViewingAgent(null)}
        title={t.agentManagement.agentDetails}
      >
        {viewingAgent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.agentManagement.agentId}</label>
                <p className="text-gray-900">{viewingAgent.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.table.status}</label>
                <StatusBadge status={viewingAgent.status}>
                  {viewingAgent.status.toUpperCase()}
                </StatusBadge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.forms.firstName}</label>
                <p className="text-gray-900">{viewingAgent.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.forms.lastName}</label>
                <p className="text-gray-900">{viewingAgent.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.forms.mobile}</label>
                <p className="text-gray-900">{viewingAgent.mobile}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.agentManagement.username}</label>
                <p className="text-gray-900">{viewingAgent.username || viewingAgent.mobile}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.agentManagement.lastLocation}</label>
              <p className="text-gray-900">{viewingAgent.lastLocation || t.agentManagement.unknown}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.agentManagement.paymentsToday}</label>
                <p className="text-gray-900">{viewingAgent.paymentsToday || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.agentManagement.totalPayments}</label>
                <p className="text-gray-900">{viewingAgent.totalPayments || 0}</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setViewingAgent(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setViewingAgent(null);
                  setEditingAgent(viewingAgent);
                  setEditPassword(''); // Reset password field
                }}
                className="flex-1"
              >
                {t.actions.editAgent}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Location View Modal */}
      <Modal
        isOpen={!!viewingLocation}
        onClose={() => setViewingLocation(null)}
        title={`Location - ${viewingLocation?.firstName} ${viewingLocation?.lastName}`}
        size="lg"
      >
        {viewingLocation && (
          <div className="space-y-4">
            {/* Agent Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t.agentManagement.agentId}:</span>
                  <span className="ml-2 text-gray-900">{viewingLocation.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.table.mobile}:</span>
                  <span className="ml-2 text-gray-900">{viewingLocation.mobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">{t.agentManagement.lastLocation}:</span>
                  <span className="ml-2 text-gray-900">{viewingLocation.lastLocation || t.agentManagement.noLocationData}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.agentManagement.latitude}:</span>
                  <span className="ml-2 text-gray-900">{viewingLocation.latitude || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t.agentManagement.longitude}:</span>
                  <span className="ml-2 text-gray-900">{viewingLocation.longitude || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Map */}
            {viewingLocation.latitude && viewingLocation.longitude ? (
              <div className="border rounded-lg overflow-hidden">
                <GoogleMap
                  locations={[{
                    id: viewingLocation.id,
                    agentId: viewingLocation.id,
                    latitude: Number(viewingLocation.latitude),
                    longitude: Number(viewingLocation.longitude),
                    location: viewingLocation.lastLocation || t.agentManagement.agentLocation,
                    isOnline: true,
                    lastSeen: viewingLocation.lastUpdated
                  }]}
                  center={{
                    lat: Number(viewingLocation.latitude),
                    lng: Number(viewingLocation.longitude)
                  }}
                  zoom={15}
                  height="400px"
                  apiKey="AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w"
                />
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <MapPin className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-semibold text-yellow-800 mb-2">{t.agentManagement.noLocationDataAvailable}</h4>
                <p className="text-sm text-yellow-700">
                  {t.agentManagement.agentHasntSharedLocation}
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setViewingLocation(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentManagement;
