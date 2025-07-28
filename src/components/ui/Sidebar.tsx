import React from 'react';
import { X, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  isLogout?: boolean;
}

interface SidebarProps {
  title: string;
  titleIcon: React.ReactNode;
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  onLogout?: () => void;
  userInfo?: {
    name: string;
    role: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({
  title,
  titleIcon,
  items,
  isOpen,
  onToggle,
  className = ''
}) => {
  const { isDark } = useTheme();
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className={`fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg shadow-md border transition-colors duration-200 ${
          isDark
            ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
            : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-72 shadow-lg z-50
        transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
        flex flex-col
      `}>
        {/* Header */}
        <div className={`p-6 border-b transition-colors duration-200 ${
          isDark
            ? 'border-gray-700 bg-gray-800'
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white">
              {titleIcon}
            </div>
            <h2 className={`text-lg font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{title}</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                ${item.active
                  ? isDark
                    ? 'bg-primary-900/50 text-primary-300 border-l-4 border-primary-400 font-semibold'
                    : 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 font-semibold'
                  : isDark
                    ? 'text-white hover:bg-gray-700 hover:text-white'
                    : 'text-white hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <div className={`w-5 h-5 ${
                item.active
                  ? isDark ? 'text-primary-400' : 'text-primary-600'
                  : 'text-white'
              }`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
