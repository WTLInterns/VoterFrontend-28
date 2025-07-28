import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';

import VidhansabhaDropdown from '../common/VidhansabhaDropdown';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  firstName?: string;
  lastName?: string;
  gender?: string;
  vidhansabhaNo?: string;
  vibhaghKramank?: string;
  paid?: boolean | null;
  searchMode?: 'contains'; // Only flexible search
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onClear,
  isLoading = false
}) => {
  const { t } = useLanguage();

  // Initial empty state
  const initialFilters: SearchFilters = {
    firstName: '',
    lastName: '',
    gender: '',
    vidhansabhaNo: '',
    vibhaghKramank: '',
    paid: null,
    searchMode: 'contains'
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if any filters are active
  useEffect(() => {
    const activeFilters = Object.entries(filters).some(([key, value]) => {
      if (key === 'searchMode') return false;
      return value !== '' && value !== null && value !== undefined;
    });
    setHasActiveFilters(activeFilters);
  }, [filters]);

  // Validation function (simplified)
  const validateFilters = (): boolean => {
    const newErrors: Record<string, string> = {};

    // No specific validations needed for flexible search
    // All fields are optional and flexible

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validateFilters()) {
      return;
    }

    // Clean and prepare filters
    const cleanFilters: SearchFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // Trim string values
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue) {
            (cleanFilters as any)[key] = trimmedValue;
          }
        } else {
          (cleanFilters as any)[key] = value;
        }
      }
    });

    // Always use flexible search (contains mode)
    cleanFilters.searchMode = 'contains';

    onSearch(cleanFilters);
    onClose();
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setErrors({});
    if (onClear) {
      onClear();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.common.search}
      size="lg"
    >
      <div className="space-y-6">


        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.forms.firstName}
            value={filters.firstName || ''}
            onChange={(value) => setFilters({ ...filters, firstName: value })}
            placeholder="Enter first name"
          />
          <Input
            label={t.forms.lastName}
            value={filters.lastName || ''}
            onChange={(value) => setFilters({ ...filters, lastName: value })}
            placeholder="Enter last name"
          />
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            value={filters.gender || ''}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vidhansabha Constituency
            </label>
            <VidhansabhaDropdown
              value={filters.vidhansabhaNo || ''}
              onChange={(value) => setFilters({...filters, vidhansabhaNo: value})}
              placeholder="Select Vidhansabha Constituency"
            />
          </div>
          <Input
            label="Vibhagh Kramank"
            value={filters.vibhaghKramank || ''}
            onChange={(value) => setFilters({ ...filters, vibhaghKramank: value })}
            placeholder="e.g., 02, 123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paid === null || filters.paid === undefined ? '' : filters.paid.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({ 
                ...filters, 
                paid: value === '' ? null : value === 'true' 
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All</option>
            <option value="true">Paid</option>
            <option value="false">Pending</option>
          </select>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center text-green-800 dark:text-green-200 text-sm">
              <Filter className="w-4 h-4 mr-2" />
              Active filters detected - Click "Search" to apply or "Clear All" to reset
            </div>
          </div>
        )}

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center text-red-800 dark:text-red-200 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Please fix the errors above before searching
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handleClear}
            className="flex-1"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading || Object.keys(errors).length > 0}
            className="flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSearchModal;
