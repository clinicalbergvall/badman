/**
 * Secure error handler to prevent data leaks
 * Sanitizes error messages before exposing them to users or logs
 */

interface SanitizedError {
  message: string;
  code?: string;
  isUserFriendly: boolean;
}

// List of sensitive patterns that should never be exposed
const SENSITIVE_PATTERNS = [
  /password/gi,
  /token/gi,
  /secret/gi,
  /api[_-]?key/gi,
  /authorization/gi,
  /bearer/gi,
  /jwt/gi,
  /session/gi,
  /cookie/gi,
  /credential/gi,
  /private[_-]?key/gi,
  /access[_-]?token/gi,
  /refresh[_-]?token/gi,
  /database/gi,
  /connection[_-]?string/gi,
  /mongodb/gi,
  /postgres/gi,
  /mysql/gi,
  /uri/gi,
  /url.*password/gi,
  /email.*password/gi,
  /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/, // Credit card patterns
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN patterns
  /phone.*number/gi,
  /address/gi,
  /location.*coordinates/gi,
];

// User-friendly error messages for common errors
const USER_FRIENDLY_MESSAGES: { [key: string]: string } = {
  'network error': 'Unable to connect to the server. Please check your internet connection.',
  'failed to fetch': 'Network connection failed. Please try again.',
  'unauthorized': 'Your session has expired. Please log in again.',
  'forbidden': 'You do not have permission to perform this action.',
  'not found': 'The requested resource was not found.',
  'internal server error': 'A server error occurred. Please try again later.',
  'bad request': 'Invalid request. Please check your input and try again.',
  'timeout': 'The request took too long. Please try again.',
  'connection': 'Connection error. Please check your internet connection.',
};

/**
 * Sanitizes an error message to prevent data leaks
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred.';
  }

  let errorMessage = '';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (typeof error === 'object' && error !== null) {
    // Try to extract message from error object
    const err = error as any;
    errorMessage = err.message || err.error || err.msg || JSON.stringify(error);
  } else {
    return 'An unexpected error occurred.';
  }

  // Check for sensitive patterns
  const hasSensitiveData = SENSITIVE_PATTERNS.some(pattern => pattern.test(errorMessage));

  if (hasSensitiveData) {
    // Return generic message if sensitive data detected
    return 'An error occurred. Please try again or contact support if the problem persists.';
  }

  // Check for user-friendly message mapping
  const lowerMessage = errorMessage.toLowerCase();
  for (const [key, friendlyMessage] of Object.entries(USER_FRIENDLY_MESSAGES)) {
    if (lowerMessage.includes(key)) {
      return friendlyMessage;
    }
  }

  // Sanitize any remaining potentially sensitive information
  let sanitized = errorMessage
    // Remove URLs with credentials
    .replace(/https?:\/\/[^@]+@[^\s]+/gi, '[URL redacted]')
    // Remove email-like patterns that might contain sensitive info
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email redacted]')
    // Remove long hex strings (potential tokens)
    .replace(/[a-f0-9]{32,}/gi, '[token redacted]')
    // Remove MongoDB ObjectIds
    .replace(/[0-9a-f]{24}/gi, '[id redacted]')
    // Limit message length
    .substring(0, 200);

  return sanitized || 'An error occurred. Please try again.';
}

/**
 * Creates a sanitized error object for safe display
 */
export function createSanitizedError(error: unknown): SanitizedError {
  const message = sanitizeErrorMessage(error);
  
  // Determine if this is a user-friendly error
  const isUserFriendly = Object.values(USER_FRIENDLY_MESSAGES).some(
    friendlyMsg => message === friendlyMsg || message.includes(friendlyMsg)
  );

  return {
    message,
    isUserFriendly,
  };
}

/**
 * Safely logs errors without exposing sensitive data
 */
export function safeLogError(context: string, error: unknown): void {
  const sanitized = createSanitizedError(error);
  
  // Only log sanitized message in production
  if (import.meta.env.PROD) {
    console.error(`[${context}]`, sanitized.message);
  } else {
    // In development, log more details but still sanitized
    console.error(`[${context}]`, {
      message: sanitized.message,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error && import.meta.env.DEV ? error.stack : '[stack redacted]',
    });
  }
}

/**
 * Gets a user-friendly error message for display in UI
 */
export function getUserFriendlyError(error: unknown): string {
  return sanitizeErrorMessage(error);
}

/**
 * Checks if an error contains sensitive information
 */
export function containsSensitiveData(error: unknown): boolean {
  if (!error) return false;
  
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    return false;
  }

  return SENSITIVE_PATTERNS.some(pattern => pattern.test(errorMessage));
}

