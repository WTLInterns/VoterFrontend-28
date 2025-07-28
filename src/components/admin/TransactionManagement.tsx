import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Table, Button, Card, Input } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';

import type { TableColumn, Transaction } from '../../types';
import { Download, Search, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';

const TransactionManagement: React.FC = () => {
  const { transactions } = useData();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const columns: TableColumn<Transaction>[] = [
    {
      key: 'id',
      label: t.transactions.transactionId,
      sortable: true
    },
    {
      key: 'userId',
      label: t.transactions.userId,
      sortable: true
    },
    {
      key: 'agentId',
      label: t.transactions.agentId,
      sortable: true
    },
    {
      key: 'amount',
      label: t.transactions.amount,
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sortable: true
    },
    {
      key: 'location',
      label: t.transactions.location,
      render: (location) => location || t.transactions.na,
      sortable: true
    },
    {
      key: 'status',
      label: t.transactions.status,
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status === 'COMPLETED' ? t.transactions.completed :
           status === 'PENDING' ? t.transactions.pending :
           t.transactions.failed}
        </span>
      ),
      sortable: true
    },
    {
      key: 'createdAt',
      label: t.transactions.dateTime,
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleString() : '-',
      sortable: true
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' || 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userId.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter;
    
    const matchesDate = (!dateFilter.start || new Date(transaction.createdAt) >= new Date(dateFilter.start)) &&
                       (!dateFilter.end || new Date(transaction.createdAt) <= new Date(dateFilter.end));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const completedTransactions = filteredTransactions.filter(t => t.status === 'COMPLETED').length;
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'PENDING').length;

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.expengo.com/api/files/export/transactions?format=xlsx', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(t.transactions.failedToExport);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(t.transactions.failedToExport);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t.transactions.title}</h1>
        <Button onClick={handleExport} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {t.transactions.exportTransactions}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.transactions.totalAmount}</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.transactions.totalTransactions}</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.transactions.completed}</p>
              <p className="text-2xl font-bold text-gray-900">{completedTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.transactions.pending}</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTransactions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.transactions.search}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t.transactions.searchTransactions}
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.transactions.status}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{t.transactions.allStatus}</option>
              <option value="COMPLETED">{t.transactions.completed}</option>
              <option value="PENDING">{t.transactions.pending}</option>
              <option value="FAILED">{t.transactions.failed}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.transactions.startDate}</label>
            <Input
              type="date"
              value={dateFilter.start}
              onChange={(value) => setDateFilter(prev => ({ ...prev, start: value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.transactions.endDate}</label>
            <Input
              type="date"
              value={dateFilter.end}
              onChange={(value) => setDateFilter(prev => ({ ...prev, end: value }))}
            />
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table
          data={filteredTransactions}
          columns={columns}
          searchable={false}
        />
      </Card>
    </div>
  );
};

export default TransactionManagement;
