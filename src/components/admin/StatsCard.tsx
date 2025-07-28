import React from 'react';
import { Card } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend
}) => {
  const { isDark } = useTheme();

  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    info: 'from-info-500 to-info-600'
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>{title}</p>
            <p className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  trend.isPositive
                    ? isDark ? 'text-success-400' : 'text-success-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                </span>
                <span className={`text-xs ml-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white shadow-md`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />
    </Card>
  );
};

export default StatsCard;
