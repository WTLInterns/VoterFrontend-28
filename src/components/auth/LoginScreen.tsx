import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

import LanguageSelector from '../ui/LanguageSelector';
import { Eye, EyeOff, Lock, Phone, Vote, Sun, Moon } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    try {
      console.log('LoginScreen: Attempting login with mobile:', mobile);
      const result = await login(mobile, password); // Role will be determined by backend

      if (!result.success) {
        setError(result.error || t.auth.invalidCredentials);
      }
    } catch (error) {
      console.error('LoginScreen: Login error:', error);
      setError(t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials removed for security

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'} flex items-center justify-center p-4 transition-colors duration-300`}>
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-white/10 text-white hover:bg-white/20'} transition-colors duration-200`}
          title={isDark ? t.auth.switchToLightMode : t.auth.switchToDarkMode}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl p-8 border backdrop-blur-sm transition-colors duration-300`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Vote className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.appName}
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>{t.auth.loginSubtitle}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="mobile" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <Phone className="w-4 h-4 inline mr-2" />
                {t.forms.mobileNumber}
              </label>
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:bg-gray-600' : 'border-gray-300 bg-gray-50 focus:bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 focus:shadow-md hover:border-gray-400`}
                placeholder={t.placeholders?.enterMobileNumber || "Enter mobile number"}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <Lock className="w-4 h-4 inline mr-2" />
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:bg-gray-600' : 'border-gray-300 bg-gray-50 focus:bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 focus:shadow-md hover:border-gray-400`}
                  placeholder={t.placeholders?.enterPassword || "Enter your password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`${isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg text-sm`}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transform hover:-translate-y-0.5 hover:from-blue-700 hover:to-purple-700 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t.common.loading}...
                  </div>
                ) : (
                  t.auth.loginButton
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2025 {t.appName}. {t.auth.allRightsReserved}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
