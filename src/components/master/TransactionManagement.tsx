import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../common/Toast';
import * as XLSX from 'xlsx';
import { Table, Button, Card } from '../ui';
import type { TableColumn, Transaction } from '../../types';
import { 
  DollarSign, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,

  CreditCard,
  RefreshCw
} from 'lucide-react';
import { DataUpdateIndicator, LiveDataBadge } from '../common/DataUpdateIndicator';
import { useInstantUpdates } from '../../hooks/useInstantUpdates';

const TransactionManagement: React.FC = () => {
  const { transactions, loadTransactions, refreshData, loading } = useData();
  const { showSuccess, showError } = useToast();
  const [localLoading, setLocalLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

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
    onRefreshStart: () => console.log('Refreshing transactions data...'),
    onRefreshEnd: () => console.log('Transactions data refreshed'),
    onError: (error) => {
      console.error('Auto-refresh error:', error);
      showError('Failed to refresh data', 'Please try again manually.');
    }
  });

  // Force re-render when transactions data changes
  useEffect(() => {
    markDataUpdated();
  }, [transactions, markDataUpdated]);

  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  // Load transactions when component mounts
  useEffect(() => {
    handleRefresh();
  }, []);

  // Update filtered transactions when transactions change
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await loadTransactions();
      showSuccess('Transactions refreshed successfully!');
    } catch (error) {
      showError('Failed to refresh transactions');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...transactions];

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(t => new Date(t.date) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(t => new Date(t.date) <= toDate);
    }

    if (filters.amountMin) {
      const minAmount = parseFloat(filters.amountMin);
      filtered = filtered.filter(t => t.amount >= minAmount);
    }

    if (filters.amountMax) {
      const maxAmount = parseFloat(filters.amountMax);
      filtered = filtered.filter(t => t.amount <= maxAmount);
    }

    setFilteredTransactions(filtered);
    showSuccess(`Found ${filtered.length} transactions`);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
    setFilteredTransactions(transactions);
    showSuccess('Filters cleared');
  };

  const exportTransactions = () => {
    // Create Excel-compatible data
    const headers = ['Paid To', 'Distributed By', 'Amount', 'Date & Time'];

    const excelData = filteredTransactions.map(t => {
      const dateValue = t.date || t.createdAt || t.timestamp;
      const dateObj = new Date(dateValue || '');
      const dateTimeStr = dateObj && !isNaN(dateObj.getTime())
        ? `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        : 'No date';

      // Get user name (first name + last name or fallback)
      const userFirstName = t.userFirstName || '';
      const userLastName = t.userLastName || '';
      const userName = (userFirstName || userLastName)
        ? `${userFirstName} ${userLastName}`.trim()
        : t.userName || t.user || 'Unknown User';

      // Get agent name (first name + last name or fallback)
      const agentFirstName = t.agentFirstName || '';
      const agentLastName = t.agentLastName || '';
      const agentName = (agentFirstName || agentLastName)
        ? `${agentFirstName} ${agentLastName}`.trim()
        : t.agent || 'Unknown Agent';

      return [userName, agentName, t.amount || 0, dateTimeStr];
    });

    // Create Excel workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // Paid To
      { wch: 20 }, // Distributed By
      { wch: 15 }, // Amount
      { wch: 20 }  // Date & Time
    ];
    ws['!cols'] = colWidths;

    // Download Excel file
    XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccess('Transactions exported to Excel successfully!');
  };

  // Calculate statistics
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = filteredTransactions.filter(t => t.status === 'COMPLETED').length;
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'PENDING').length;
  const failedTransactions = filteredTransactions.filter(t => t.status === 'FAILED').length;

  const columns: TableColumn<Transaction>[] = [
    {
      key: 'userName',
      label: 'Paid To',
      sortable: true,
      render: (_, transaction) => {
        // Try to get first name and last name
        const firstName = transaction.userFirstName || '';
        const lastName = transaction.userLastName || '';

        // If we have first name or last name, use them
        if (firstName || lastName) {
          return <span className="font-medium">{`${firstName} ${lastName}`.trim()}</span>;
        }

        // Otherwise try to use full name or fallback
        return (
          <span className="font-medium">
            {transaction.userName || transaction.user || 'Unknown User'}
          </span>
        );
      }
    },
    {
      key: 'agent',
      label: 'Distributed By',
      sortable: true,
      render: (_, transaction) => {
        // Try to get agent's first name and last name
        const agentFirstName = transaction.agentFirstName || '';
        const agentLastName = transaction.agentLastName || '';

        // If we have first name or last name, use them
        if (agentFirstName || agentLastName) {
          return <span className="font-medium">{`${agentFirstName} ${agentLastName}`.trim()}</span>;
        }

        // Otherwise try to use agent name or fallback
        return (
          <span className="font-medium">
            {transaction.agent || 'Unknown Agent'}
          </span>
        );
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₹{amount?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (_, transaction) => {
        // Try different date fields
        const dateValue = transaction.date || transaction.createdAt || transaction.timestamp;
        if (!dateValue) return <span className="text-gray-500">No date</span>;

        const dateObj = new Date(dateValue);
        if (isNaN(dateObj.getTime())) return <span className="text-gray-500">Invalid date</span>;

        return (
          <span>
            {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transaction Management
        </h2>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleRefresh} disabled={localLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${localLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="secondary" onClick={exportTransactions}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTransactions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingTransactions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {failedTransactions}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.amountMin}
              onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
              placeholder="₹0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={filters.amountMax}
              onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
              placeholder="₹10000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-4">
          <Button onClick={handleFilter}>
            Apply Filters
          </Button>
          <Button variant="secondary" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Transactions ({filteredTransactions.length})</h3>
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
            data={filteredTransactions}
            columns={columns}
          />
        </div>
      </Card>
    </div>
  );
};

export default TransactionManagement;
