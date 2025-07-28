import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, Input } from '../ui';
import { Settings, Save, RefreshCw, Shield, Database } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const { systemSettings, updateSystemSettings } = useData();
  const { t } = useLanguage();
  const [settings, setSettings] = useState(systemSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSystemSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({
      defaultPaymentAmount: 5000,
      sessionTimeout: 30
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      {/* Payment Settings */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Payment Amount (₹)"
              type="number"
              value={settings.defaultPaymentAmount.toString()}
              onChange={(value) => setSettings({ ...settings, defaultPaymentAmount: parseInt(value) || 0 })}
            />
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={settings.sessionTimeout.toString()}
              onChange={(value) => setSettings({ ...settings, sessionTimeout: parseInt(value) || 30 })}
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password Policy</label>
              <select className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>Strong (8+ chars, mixed case, numbers)</option>
                <option>Medium (6+ chars, mixed case)</option>
                <option>Basic (4+ chars)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Login Attempts</label>
              <select className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>3 attempts</option>
                <option>5 attempts</option>
                <option>10 attempts</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Database Settings */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Database Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Backup Frequency</label>
              <select className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Data Retention</label>
              <select className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>1 Year</option>
                <option>2 Years</option>
                <option>5 Years</option>
                <option>Indefinite</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* FCM Token Management - Temporarily disabled */}
      {/* <FCMTokenManager className="mt-6" /> */}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.buttons.resetForm}
        </Button>

        <Button
          variant={saved ? "success" : "primary"}
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? t.success.settingsSaved : t.buttons.saveChanges}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
