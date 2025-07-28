import React from 'react';
import type { StatusBadgeProps } from '../../types';
import { CheckCircle, XCircle, Clock, AlertTriangle, Info, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const { isDark } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          classes: isDark
            ? 'bg-green-900/30 text-green-300 border-green-700'
            : 'bg-success-100 text-success-800 border-success-200',
          icon: CheckCircle
        };
      case 'blocked':
        return {
          classes: isDark
            ? 'bg-red-900/30 text-red-300 border-red-700'
            : 'bg-danger-100 text-danger-800 border-danger-200',
          icon: XCircle
        };
      case 'paid':
        return {
          classes: isDark
            ? 'bg-green-900/30 text-green-300 border-green-700'
            : 'bg-success-100 text-success-800 border-success-200',
          icon: CheckCircle
        };
      case 'pending':
        return {
          classes: isDark
            ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
            : 'bg-warning-100 text-warning-800 border-warning-200',
          icon: Clock
        };
      case 'success':
        return {
          classes: isDark
            ? 'bg-green-900/30 text-green-300 border-green-700'
            : 'bg-success-100 text-success-800 border-success-200',
          icon: CheckCircle
        };
      case 'warning':
        return {
          classes: isDark
            ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
            : 'bg-warning-100 text-warning-800 border-warning-200',
          icon: AlertTriangle
        };
      case 'danger':
        return {
          classes: isDark
            ? 'bg-red-900/30 text-red-300 border-red-700'
            : 'bg-danger-100 text-danger-800 border-danger-200',
          icon: XCircle
        };
      case 'info':
        return {
          classes: isDark
            ? 'bg-blue-900/30 text-blue-300 border-blue-700'
            : 'bg-info-100 text-info-800 border-info-200',
          icon: Info
        };
      default:
        return {
          classes: isDark
            ? 'bg-gray-700 text-gray-300 border-gray-600'
            : 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Shield
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes}`}>
      <IconComponent className="w-3 h-3" />
      {children}
    </span>
  );
};

export default StatusBadge;
