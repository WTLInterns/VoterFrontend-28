import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false
}) => {
  const { isDark } = useTheme();

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-medium',
    lg: 'shadow-large'
  };

  const hoverClasses = hover ? 'hover:shadow-large transition-shadow duration-200' : '';

  return (
    <div className={`
      ${isDark
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-900'
      }
      rounded-lg border transition-colors duration-200
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${hoverClasses}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
