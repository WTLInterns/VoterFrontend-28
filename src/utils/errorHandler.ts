/**
 * Error handling utilities for better user experience
 */

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Extract meaningful error message from various error types
 */
export const extractErrorMessage = (error: any): ErrorResponse => {
  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR'
    };
  }

  // HTTP errors
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Server provided error message
    if (data?.message) {
      return {
        message: data.message,
        code: data.code || `HTTP_${status}`,
        details: data.details
      };
    }

    // Standard HTTP status messages
    switch (status) {
      case 400:
        return {
          message: 'Invalid request. Please check your input and try again.',
          code: 'BAD_REQUEST'
        };
      case 401:
        return {
          message: 'Authentication failed. Please login again.',
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: 'Access denied. You do not have permission to perform this action.',
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: 'Resource not found. Please refresh the page and try again.',
          code: 'NOT_FOUND'
        };
      case 409:
        return {
          message: 'Conflict detected. The resource already exists or has been modified.',
          code: 'CONFLICT'
        };
      case 422:
        return {
          message: 'Validation failed. Please check your input and try again.',
          code: 'VALIDATION_ERROR'
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR'
        };
      default:
        return {
          message: `Server error (${status}). Please try again later.`,
          code: `HTTP_${status}`
        };
    }
  }

  // JavaScript Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      code: 'JS_ERROR'
    };
  }

  // String errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR'
    };
  }

  // Unknown error types
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  };
};

/**
 * Validation error messages for common scenarios
 */
export const ValidationErrors = {
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID_LENGTH: 'Phone number must be exactly 10 digits',
  PHONE_INVALID_FORMAT: 'Phone number must start with 6, 7, 8, or 9',
  PHONE_ALREADY_EXISTS: 'This phone number is already registered',

  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORD_WEAK: 'Password must contain at least one letter and one number',

  NAME_REQUIRED: 'Name is required',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  NAME_INVALID: 'Name can only contain letters and spaces',

  VIBHAGH_KRAMANK_REQUIRED: 'Vibhagh Kramank is required',
  VIBHAGH_KRAMANK_INVALID: 'Vibhagh Kramank can only contain numbers',
  VIDHANSABHA_REQUIRED: 'Vidhansabha Constituency is required',

  AGE_REQUIRED: 'Age is required',
  AGE_INVALID: 'Age must be at least 18 years',
  
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_ALREADY_EXISTS: 'This email is already registered',
  
  REQUIRED_FIELD: 'This field is required',
  INVALID_INPUT: 'Please enter a valid value',
  
  // Form-specific errors
  FORM_INCOMPLETE: 'Please fill in all required fields',
  FORM_INVALID: 'Please correct the errors and try again',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size is too large. Maximum size is 10MB',
  FILE_INVALID_TYPE: 'Invalid file type. Please upload a valid file',
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again',
  
  // Date/time errors
  DATE_REQUIRED: 'Date is required',
  DATE_INVALID: 'Please enter a valid date',
  DATE_FUTURE: 'Date cannot be in the future',
  DATE_PAST: 'Date cannot be in the past'
} as const;

/**
 * Success messages for common operations
 */
export const SuccessMessages = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
  UPLOADED: 'Uploaded successfully',
  SENT: 'Sent successfully',
  
  // Specific operations
  AGENT_CREATED: 'Agent created successfully',
  AGENT_UPDATED: 'Agent updated successfully',
  AGENT_DELETED: 'Agent deleted successfully',
  
  VOTER_CREATED: 'Voter created successfully',
  VOTER_UPDATED: 'Voter updated successfully',
  VOTER_DELETED: 'Voter deleted successfully',
  
  ISSUE_CREATED: 'Issue reported successfully',
  ISSUE_UPDATED: 'Issue updated successfully',
  ISSUE_RESOLVED: 'Issue resolved successfully',
  
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully'
} as const;

/**
 * Format error for display in toast notifications
 */
export const formatErrorForToast = (error: any): { title: string; message: string } => {
  const errorInfo = extractErrorMessage(error);
  
  return {
    title: 'Error',
    message: errorInfo.message
  };
};

/**
 * Format success message for display in toast notifications
 */
export const formatSuccessForToast = (message: string, details?: string): { title: string; message: string } => {
  return {
    title: 'Success',
    message: details ? `${message}\n${details}` : message
  };
};

/**
 * Comprehensive validation functions for consistent validation across create and update operations
 */
export const ValidationUtils = {
  /**
   * Validate mobile number - exactly 10 digits, starts with 6-9
   */
  validateMobileNumber: (mobile: string): string | null => {
    if (!mobile || mobile.trim().length === 0) {
      return ValidationErrors.PHONE_REQUIRED;
    }

    // Remove any non-digit characters for validation
    const cleanedMobile = mobile.replace(/[^\d]/g, '');

    // Must be exactly 10 digits
    if (cleanedMobile.length !== 10) {
      return ValidationErrors.PHONE_INVALID_LENGTH;
    }

    // Must start with 6, 7, 8, or 9 (Indian mobile number format)
    if (!/^[6-9]/.test(cleanedMobile)) {
      return ValidationErrors.PHONE_INVALID_FORMAT;
    }

    return null;
  },

  /**
   * Validate Vibhagh Kramank - numbers only
   */
  validateVibhaghKramank: (vibhaghKramank: string): string | null => {
    if (!vibhaghKramank || vibhaghKramank.trim().length === 0) {
      return ValidationErrors.VIBHAGH_KRAMANK_REQUIRED;
    }

    // Must contain only numbers
    if (!/^\d+$/.test(vibhaghKramank.trim())) {
      return ValidationErrors.VIBHAGH_KRAMANK_INVALID;
    }

    return null;
  },

  /**
   * Validate Vidhansabha Constituency
   */
  validateVidhansabha: (vidhansabhaNo: string): string | null => {
    if (!vidhansabhaNo || vidhansabhaNo.trim().length === 0) {
      return ValidationErrors.VIDHANSABHA_REQUIRED;
    }
    return null;
  },

  /**
   * Validate name fields
   */
  validateName: (name: string, fieldName: string = 'Name'): string | null => {
    if (!name || name.trim().length === 0) {
      return `${fieldName} is required`;
    }

    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }

    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }

    return null;
  },

  /**
   * Validate age
   */
  validateAge: (age: number): string | null => {
    if (!age || age < 18) {
      return ValidationErrors.AGE_INVALID;
    }

    if (age > 120) {
      return 'Age cannot exceed 120 years';
    }

    return null;
  },

  /**
   * Validate all voter fields for create/update operations
   */
  validateVoterData: (voterData: {
    firstName: string;
    lastName: string;
    age: number;
    vidhansabhaNo: string;
    vibhaghKramank: string;
    mobile?: string;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate first name
    const firstNameError = ValidationUtils.validateName(voterData.firstName, 'First Name');
    if (firstNameError) errors.push(firstNameError);

    // Validate last name
    const lastNameError = ValidationUtils.validateName(voterData.lastName, 'Last Name');
    if (lastNameError) errors.push(lastNameError);

    // Validate age
    const ageError = ValidationUtils.validateAge(voterData.age);
    if (ageError) errors.push(ageError);

    // Validate Vidhansabha
    const vidhansabhaError = ValidationUtils.validateVidhansabha(voterData.vidhansabhaNo);
    if (vidhansabhaError) errors.push(vidhansabhaError);

    // Validate Vibhagh Kramank
    const vibhaghError = ValidationUtils.validateVibhaghKramank(voterData.vibhaghKramank);
    if (vibhaghError) errors.push(vibhaghError);

    // Validate mobile if provided
    if (voterData.mobile) {
      const mobileError = ValidationUtils.validateMobileNumber(voterData.mobile);
      if (mobileError) errors.push(mobileError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
