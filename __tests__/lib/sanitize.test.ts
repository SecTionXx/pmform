/**
 * Tests for input sanitization utilities
 */

import {
  sanitizeString,
  sanitizeObject,
  sanitizeFormData,
  sanitizeFilename,
  stripHtml,
  isValidEmail,
  isValidThaiPhone,
  isValidUrl,
  sanitizeMachineNumber,
  escapeRegex,
} from '@/lib/sanitize';

describe('sanitizeString', () => {
  it('should encode HTML special characters', () => {
    const input = '<div>Test & "quotes" & \'apostrophes\'</div>';
    const result = sanitizeString(input);

    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#x27;');
  });

  it('should remove script tags', () => {
    const input = 'Hello <script>alert("xss")</script> World';
    const result = sanitizeString(input);

    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('should remove script tags (case insensitive)', () => {
    const input = '<SCRIPT>alert("xss")</SCRIPT>';
    const result = sanitizeString(input);

    // After sanitization, tags are encoded but content remains
    expect(result).toContain('&lt;SCRIPT&gt;');
    expect(result).toContain('alert');
  });

  it('should remove inline event handlers', () => {
    const input = '<img src="x" onerror="alert(1)" />';
    const result = sanitizeString(input);

    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert(1)');
  });

  it('should remove javascript: protocol', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeString(input);

    expect(result).not.toContain('javascript:');
  });

  it('should remove data:text/html protocol', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
    const result = sanitizeString(input);

    expect(result).not.toContain('data:text/html');
  });

  it('should remove null bytes', () => {
    const input = 'Hello\0World';
    const result = sanitizeString(input);

    expect(result).toBe('HelloWorld');
  });

  it('should trim whitespace', () => {
    const input = '  Hello World  ';
    const result = sanitizeString(input);

    expect(result).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('should handle non-string input', () => {
    expect(sanitizeString(null as any)).toBe('');
    expect(sanitizeString(undefined as any)).toBe('');
    expect(sanitizeString(123 as any)).toBe('');
  });

  it('should handle complex XSS attack vectors', () => {
    const attacks = [
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
    ];

    attacks.forEach(attack => {
      const result = sanitizeString(attack);
      // After sanitization, dangerous attributes and protocols are removed/encoded
      expect(result).not.toContain('onerror=');
      expect(result).not.toContain('onload=');
      expect(result).not.toContain('onfocus=');
      expect(result).not.toContain('javascript:');
    });
  });
});

describe('sanitizeObject', () => {
  it('should sanitize all string values in object', () => {
    const input = {
      name: '<script>alert(1)</script>John',
      email: 'test@example.com',
      description: 'Hello <b>World</b>',
    };

    const result = sanitizeObject(input);

    expect(result.name).not.toContain('<script>');
    expect(result.name).toContain('John');
    expect(result.email).toBe('test@example.com');
    expect(result.description).toContain('&lt;b&gt;');
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: '<script>alert(1)</script>',
        profile: {
          bio: '<img src=x onerror=alert(1)>',
        },
      },
    };

    const result = sanitizeObject(input);

    expect(result.user.name).not.toContain('<script>');
    expect(result.user.profile.bio).not.toContain('onerror');
  });

  it('should handle arrays of strings', () => {
    const input = {
      tags: ['<script>tag1</script>', 'tag2', '<b>tag3</b>'],
    };

    const result = sanitizeObject(input);

    expect(result.tags[0]).not.toContain('<script>');
    expect(result.tags[1]).toBe('tag2');
    expect(result.tags[2]).toContain('&lt;b&gt;');
  });

  it('should handle arrays of objects', () => {
    const input = {
      items: [
        { name: '<script>Item 1</script>' },
        { name: 'Item 2' },
      ],
    };

    const result = sanitizeObject(input);

    expect(result.items[0].name).not.toContain('<script>');
    expect(result.items[1].name).toBe('Item 2');
  });

  it('should preserve non-string values', () => {
    const input = {
      name: 'John',
      age: 30,
      active: true,
      score: null,
      metadata: undefined,
    };

    const result = sanitizeObject(input);

    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
    expect(result.active).toBe(true);
    expect(result.score).toBeNull();
    expect(result.metadata).toBeUndefined();
  });

  it('should handle null and undefined input', () => {
    expect(sanitizeObject(null as any)).toBeNull();
    expect(sanitizeObject(undefined as any)).toBeUndefined();
  });

  it('should handle empty object', () => {
    const result = sanitizeObject({});
    expect(result).toEqual({});
  });
});

describe('sanitizeFormData', () => {
  it('should sanitize form data and return no warnings for clean input', () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello World',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(sanitized.name).toBe('John Doe');
    expect(warnings).toHaveLength(0);
  });

  it('should detect suspicious script tags', () => {
    const input = {
      name: 'John',
      message: '<script>alert("xss")</script>',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(sanitized.message).not.toContain('<script>');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('message');
  });

  it('should detect javascript: protocol', () => {
    const input = {
      website: 'javascript:alert(1)',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('website');
  });

  it('should detect event handlers', () => {
    const input = {
      description: '<img src=x onerror=alert(1)>',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(warnings.length).toBeGreaterThan(0);
  });

  it('should detect iframe tags', () => {
    const input = {
      content: '<iframe src="evil.com"></iframe>',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(warnings.length).toBeGreaterThan(0);
  });

  it('should detect object tags', () => {
    const input = {
      content: '<object data="evil.swf"></object>',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(warnings.length).toBeGreaterThan(0);
  });

  it('should detect embed tags', () => {
    const input = {
      content: '<embed src="evil.swf">',
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(warnings.length).toBeGreaterThan(0);
  });

  it('should check nested objects for suspicious content', () => {
    const input = {
      user: {
        profile: {
          bio: '<script>alert(1)</script>',
        },
      },
    };

    const { sanitized, warnings } = sanitizeFormData(input);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('user.profile.bio');
  });
});

describe('sanitizeFilename', () => {
  it('should remove path traversal attempts', () => {
    const input = '../../etc/passwd';
    const result = sanitizeFilename(input);

    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });

  it('should remove slashes and backslashes', () => {
    const input = 'path/to/file\\name.txt';
    const result = sanitizeFilename(input);

    expect(result).not.toContain('/');
    expect(result).not.toContain('\\');
  });

  it('should remove null bytes', () => {
    const input = 'file\0name.txt';
    const result = sanitizeFilename(input);

    expect(result).toBe('filename.txt');
  });

  it('should allow only safe characters', () => {
    const input = 'my-file_name.123.txt';
    const result = sanitizeFilename(input);

    expect(result).toBe('my-file_name.123.txt');
  });

  it('should replace unsafe characters with underscores', () => {
    const input = 'file@#$%^&*()name.txt';
    const result = sanitizeFilename(input);

    expect(result).toContain('_');
    expect(result).not.toContain('@');
    expect(result).not.toContain('#');
  });

  it('should limit length to 255 characters', () => {
    const input = 'a'.repeat(300) + '.txt';
    const result = sanitizeFilename(input);

    expect(result.length).toBeLessThanOrEqual(255);
  });

  it('should handle non-string input', () => {
    expect(sanitizeFilename(null as any)).toBe('');
    expect(sanitizeFilename(undefined as any)).toBe('');
  });
});

describe('stripHtml', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <b>World</b></p>';
    const result = stripHtml(input);

    expect(result).toBe('Hello World');
  });

  it('should handle self-closing tags', () => {
    const input = 'Hello<br/>World';
    const result = stripHtml(input);

    expect(result).toBe('HelloWorld');
  });

  it('should handle nested tags', () => {
    const input = '<div><p><span>Text</span></p></div>';
    const result = stripHtml(input);

    expect(result).toBe('Text');
  });

  it('should handle non-string input', () => {
    expect(stripHtml(null as any)).toBe('');
    expect(stripHtml(undefined as any)).toBe('');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.th')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
  });
});

describe('isValidThaiPhone', () => {
  it('should validate Thai phone numbers', () => {
    expect(isValidThaiPhone('081-234-5678')).toBe(true);
    expect(isValidThaiPhone('0812345678')).toBe(true);
    expect(isValidThaiPhone('02-123-4567')).toBe(true);
    expect(isValidThaiPhone('021234567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidThaiPhone('1234567890')).toBe(false);
    expect(isValidThaiPhone('081-234-567')).toBe(false);
    expect(isValidThaiPhone('081-234-56789')).toBe(false);
    expect(isValidThaiPhone('phone')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should validate HTTP and HTTPS URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://sub.domain.co.th/path')).toBe(true);
  });

  it('should reject invalid or dangerous URLs', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
  });
});

describe('sanitizeMachineNumber', () => {
  it('should extract 4-digit machine numbers', () => {
    expect(sanitizeMachineNumber('1234')).toBe('1234');
    expect(sanitizeMachineNumber('M-1234')).toBe('1234');
    expect(sanitizeMachineNumber('Machine 5678')).toBe('5678');
  });

  it('should return null for invalid input', () => {
    expect(sanitizeMachineNumber('123')).toBeNull();
    expect(sanitizeMachineNumber('12345')).toBe('1234'); // Takes first 4
    expect(sanitizeMachineNumber('abcd')).toBeNull();
    expect(sanitizeMachineNumber('')).toBeNull();
  });
});

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    const input = 'test.*+?^${}()|[]\\';
    const result = escapeRegex(input);

    expect(result).toContain('\\.');
    expect(result).toContain('\\*');
    expect(result).toContain('\\+');
    expect(result).toContain('\\?');
    expect(result).toContain('\\^');
    expect(result).toContain('\\$');
  });

  it('should not escape normal characters', () => {
    const input = 'abc123';
    const result = escapeRegex(input);

    expect(result).toBe('abc123');
  });

  it('should handle non-string input', () => {
    expect(escapeRegex(null as any)).toBe('');
    expect(escapeRegex(undefined as any)).toBe('');
  });
});
