import React from 'react';
import { CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DataUpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdated?: Date;
  className?: string;
}

interface LiveDataBadgeProps {
  isLive: boolean;
  className?: string;
}

export const DataUpdateIndicator: React.FC<DataUpdateIndicatorProps> = ({
  isUpdating,
  lastUpdated,
  className = ''
}) => {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isUpdating) {
    return (
      <div className={`flex items-center space-x-2 text-blue-600 ${className}`}>
        <Clock className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Updating...</span>
      </div>
    );
  }

  if (lastUpdated) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Updated {formatLastUpdated(lastUpdated)}</span>
      </div>
    );
  }

  return null;
};

export const LiveDataBadge: React.FC<LiveDataBadgeProps> = ({
  isLive,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {isLive ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            {t.table.live}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
            {t.table.offline}
          </span>
        </>
      )}
    </div>
  );
};

export default DataUpdateIndicator;
