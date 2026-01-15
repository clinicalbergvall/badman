/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitizes plain text by removing HTML tags and encoding special characters
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
}

/**
 * Sanitizes user input for database storage
 * Removes null bytes and trims whitespace
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitizes phone number input
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove all non-digit characters except +
  return input.replace(/[^\d+]/g, '');
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and trim
  return input.replace(/\0/g, '').trim().toLowerCase();
}

/**
 * Sanitizes URL input
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove javascript: and data: protocols
  let sanitized = input.replace(/^javascript:/i, '');
  sanitized = sanitized.replace(/^data:text\/html/i, '');
  
  return sanitized.trim();
}

/**
 * Sanitizes message content for chat
 */
export function sanitizeMessage(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags but preserve line breaks
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Preserve line breaks by converting to <br> (will be rendered safely)
  sanitized = sanitized.replace(/\n/g, '<br>');
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized.trim();
}

