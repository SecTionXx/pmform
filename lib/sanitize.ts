/**
 * Input sanitization utilities for XSS prevention
 * Lightweight implementation without external dependencies
 */

/**
 * Sanitize a single string value
 * Removes potentially dangerous characters and patterns
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Encode HTML special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove script tags (case insensitive)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize an object recursively
 * Applies sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T
): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object'
          ? sanitizeObject(item)
          : item
      ) as T[keyof T];
    } else if (value !== null && typeof value === 'object') {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize form data
 * Additional validation rules for specific fields
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T
): { sanitized: T; warnings: string[] } {
  const warnings: string[] = [];
  const sanitized = sanitizeObject(data);

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  const checkValue = (value: any, path: string = '') => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          warnings.push(
            `Suspicious content detected in field: ${path || 'unknown'}`
          );
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        checkValue(val, path ? `${path}.${key}` : key);
      }
    }
  };

  checkValue(data);

  return { sanitized, warnings };
}

/**
 * Sanitize filename (for photo uploads)
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';

  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Allow only safe characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Limit length
    .slice(0, 255)
    .trim();
}

/**
 * Validate email format (basic)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Thai format)
 */
export function isValidThaiPhone(phone: string): boolean {
  // Thai phone: 0XX-XXX-XXXX or 0XXXXXXXXX
  const phoneRegex = /^0\d{1,2}-?\d{3}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Strip HTML tags completely
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Escape special regex characters
 */
export function escapeRegex(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate URL (basic check)
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate machine number (4 digits)
 */
export function sanitizeMachineNumber(input: string): string | null {
  const sanitized = input.replace(/\D/g, '').slice(0, 4);
  return sanitized.length === 4 ? sanitized : null;
}

/**
 * Log sanitization event (for monitoring)
 */
export function logSanitization(
  field: string,
  original: string,
  sanitized: string
): void {
  if (original !== sanitized) {
    console.warn('Input sanitized:', {
      field,
      original: original.substring(0, 100),
      sanitized: sanitized.substring(0, 100),
      timestamp: new Date().toISOString(),
    });
  }
}
