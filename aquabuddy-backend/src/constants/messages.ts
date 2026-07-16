export const MESSAGES = {
  // Auth
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'An account with this email already exists',
    EMAIL_NOT_FOUND: 'No account found with this email',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'You do not have permission to perform this action',
    PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
  },

  // User
  USER: {
    PROFILE_UPDATED: 'Profile updated successfully',
    USER_DELETED: 'User deleted successfully',
    USER_NOT_FOUND: 'User not found',
    ROLE_UPDATED: 'User role updated successfully',
    STATUS_UPDATED: 'User status updated successfully',
  },

  // Robot
  ROBOT: {
    CREATED: 'Robot created successfully',
    UPDATED: 'Robot updated successfully',
    DELETED: 'Robot deleted successfully',
    NOT_FOUND: 'Robot not found',
    LINKED: 'Robot linked successfully',
    STATUS_UPDATED: 'Robot status updated successfully',
    COMMAND_SENT: 'Command sent to robot',
    INVALID_CODE: 'Invalid robot code',
  },

  // Sensor
  SENSOR: {
    READING_SAVED: 'Sensor reading saved successfully',
    BATCH_SAVED: 'Batch readings saved successfully',
    NO_READINGS: 'No sensor readings found for this robot',
  },

  // Alert
  ALERT: {
    ACKNOWLEDGED: 'Alert acknowledged',
    RESOLVED: 'Alert resolved',
    NOT_FOUND: 'Alert not found',
  },

  // Feedback
  FEEDBACK: {
    SUBMITTED: 'Feedback submitted successfully',
    RESPONDED: 'Feedback response sent',
    NOT_FOUND: 'Feedback not found',
  },

  // General
  GENERAL: {
    SUCCESS: 'Operation completed successfully',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'An internal server error occurred',
    RATE_LIMIT: 'Too many requests, please try again later',
  },
} as const;
