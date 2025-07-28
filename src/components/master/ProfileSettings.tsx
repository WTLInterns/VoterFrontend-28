import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { Card, Button, Input } from '../ui';
import { User, Lock, Save, Eye, EyeOff, Shield } from 'lucide-react';
import { ValidationUtils } from '../../utils/errorHandler';

const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPhoneNumber: user?.username || '', // username is actually phone number
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if user is trying to make any changes
    const isChangingPhoneNumber = formData.newPhoneNumber.trim() !== '' && formData.newPhoneNumber !== user?.username;
    const isChangingPassword = formData.newPassword.trim() !== '';

    if (!isChangingPhoneNumber && !isChangingPassword) {
      newErrors.general = 'Please make at least one change (phone number or password)';
      setErrors(newErrors);
      return false;
    }

    // Current password is required only if making changes
    if ((isChangingPhoneNumber || isChangingPassword) && !formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required to make changes';
    }

    // Phone number validation (only if changing phone number)
    if (isChangingPhoneNumber) {
      if (!formData.newPhoneNumber.trim()) {
        newErrors.newPhoneNumber = 'Phone number cannot be empty when changing';
      } else {
        // Use centralized validation
        const phoneError = ValidationUtils.validateMobileNumber(formData.newPhoneNumber);
        if (phoneError) {
          newErrors.newPhoneNumber = phoneError;
        }
      }
    }

    // Password validation (only if changing password)
    if (isChangingPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters long';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        currentPassword: formData.currentPassword
      };

      // Only include phone number if it's being changed
      if (formData.newPhoneNumber !== user?.username) {
        updateData.newUsername = formData.newPhoneNumber; // Backend still expects 'newUsername' field
      }

      // Only include password if it's being changed
      if (formData.newPassword.trim() !== '') {
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('https://api.expengo.com/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const isChangingPhoneNumber = formData.newPhoneNumber !== user?.username;
        const isChangingPassword = formData.newPassword.trim() !== '';

        let successMessage = 'Profile updated successfully!';
        if (isChangingPhoneNumber && isChangingPassword) {
          successMessage = 'Phone number and password updated successfully!';
        } else if (isChangingPhoneNumber) {
          successMessage = 'Phone number updated successfully!';
        } else if (isChangingPassword) {
          successMessage = 'Password updated successfully!';
        }

        showSuccess(successMessage);

        // Update the auth context with new user data if phone number changed
        if (updateProfile && isChangingPhoneNumber) {
          updateProfile({ ...user, username: formData.newPhoneNumber });
        }

        // Clear the form
        setFormData({
          currentPassword: '',
          newPhoneNumber: isChangingPhoneNumber ? formData.newPhoneNumber : user?.username || '',
          newPassword: '',
          confirmPassword: ''
        });

        // If phone number changed, show additional note
        if (isChangingPhoneNumber) {
          setTimeout(() => {
            showSuccess('Please note your new phone number for future logins.');
          }, 2000);
        }
        
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      showError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Update your login credentials and account information
          </p>
        </div>
      </div>

      {/* Current User Info */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Current Account
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              Phone Number: <span className="font-mono">{user?.username}</span>
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Role: <span className="font-semibold">Master Administrator</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Update Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Update Credentials (Optional)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            You can update your phone number, password, or both. Leave fields unchanged if you don't want to modify them.
          </p>

          {/* General Error Display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(value) => setFormData({ ...formData, currentPassword: value })}
                placeholder="Enter your current password"
                error={errors.currentPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Required only when making changes</p>
          </div>

          {/* New Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={formData.newPhoneNumber}
              onChange={(value) => {
                // Only allow numbers and limit to 10 digits
                const numericValue = value.replace(/[^\d]/g, '').slice(0, 10);
                setFormData({ ...formData, newPhoneNumber: numericValue });
              }}
              placeholder="Enter phone number"
              error={errors.newPhoneNumber}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Leave empty to keep current phone number. If changing, must be exactly 10 digits.
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password *
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(value) => setFormData({ ...formData, newPassword: value })}
                placeholder="Enter new password"
                error={errors.newPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          {formData.newPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                  placeholder="Confirm your new password"
                  error={errors.confirmPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Updating...' : 'Update Profile'}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Notice */}
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              Security Notice
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              • Keep your credentials secure and don't share them with anyone<br/>
              • Use a strong password with at least 6 characters<br/>
              • If you change your phone number, make note of it for future logins
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
