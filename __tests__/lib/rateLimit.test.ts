/**
 * Tests for rate limiting utilities
 */

import {
  checkRateLimit,
  getRateLimitHeaders,
  getClientIp,
  resetRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
} from '@/lib/rateLimit';

// Polyfill for Request in Node.js test environment
global.Request = class Request {
  headers: Headers;

  constructor(url: string, init?: { headers?: Headers }) {
    this.headers = init?.headers || new Headers();
  }
} as any;

global.Headers = class Headers {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  set(key: string, value: string) {
    this.store.set(key.toLowerCase(), value);
  }

  get(key: string): string | null {
    return this.store.get(key.toLowerCase()) || null;
  }
} as any;

describe('checkRateLimit', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('should allow first request', () => {
    const result = checkRateLimit('test-ip-1', {
      maxRequests: 10,
      windowMs: 60000,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
  });

  it('should track multiple requests from same identifier', () => {
    const identifier = 'test-ip-2';

    // First 10 requests should be allowed
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(identifier, {
        maxRequests: 10,
        windowMs: 60000,
      });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9 - i);
    }

    // 11th request should be blocked
    const blockedResult = checkRateLimit(identifier, {
      maxRequests: 10,
      windowMs: 60000,
    });
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });

  it('should use default config values', () => {
    const result = checkRateLimit('test-ip-3');

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
  });

  it('should handle different identifiers separately', () => {
    const result1 = checkRateLimit('ip-1', {
      maxRequests: 5,
      windowMs: 60000,
    });
    const result2 = checkRateLimit('ip-2', {
      maxRequests: 5,
      windowMs: 60000,
    });

    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
    expect(result1.remaining).toBe(4);
    expect(result2.remaining).toBe(4);
  });

  it('should reset after window expires', async () => {
    const identifier = 'test-ip-4';

    // Use up all requests
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, {
        maxRequests: 5,
        windowMs: 100, // 100ms window
      });
    }

    // Next request should be blocked
    const blockedResult = checkRateLimit(identifier, {
      maxRequests: 5,
      windowMs: 100,
    });
    expect(blockedResult.allowed).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Request should be allowed again
    const allowedResult = checkRateLimit(identifier, {
      maxRequests: 5,
      windowMs: 100,
    });
    expect(allowedResult.allowed).toBe(true);
    expect(allowedResult.remaining).toBe(4);
  });

  it('should return correct resetIn time', () => {
    const result = checkRateLimit('test-ip-5', {
      maxRequests: 10,
      windowMs: 60000,
    });

    expect(result.resetIn).toBeGreaterThan(0);
    expect(result.resetIn).toBeLessThanOrEqual(60);
  });

  it('should return correct resetAt timestamp', () => {
    const now = Date.now();
    const result = checkRateLimit('test-ip-6', {
      maxRequests: 10,
      windowMs: 60000,
    });

    expect(result.resetAt).toBeGreaterThan(now);
    expect(result.resetAt).toBeLessThanOrEqual(now + 60000);
  });

  it('should handle custom identifier config', () => {
    const result = checkRateLimit('original-id', {
      maxRequests: 10,
      windowMs: 60000,
      identifier: 'custom-id',
    });

    expect(result.allowed).toBe(true);

    // Using custom identifier
    const result2 = checkRateLimit('different-id', {
      maxRequests: 10,
      windowMs: 60000,
      identifier: 'custom-id',
    });

    // Should be on second request for custom-id
    expect(result2.remaining).toBe(8);
  });
});

describe('getRateLimitHeaders', () => {
  it('should return correct headers', () => {
    const result = {
      allowed: true,
      remaining: 9,
      limit: 10,
      resetIn: 60,
      resetAt: Date.now() + 60000,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(headers['X-RateLimit-Remaining']).toBe('9');
    expect(headers['X-RateLimit-Reset']).toBe(result.resetAt.toString());
    expect(headers['Retry-After']).toBe('60');
  });

  it('should handle zero remaining', () => {
    const result = {
      allowed: false,
      remaining: 0,
      limit: 10,
      resetIn: 30,
      resetAt: Date.now() + 30000,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBe('30');
  });
});

describe('getClientIp', () => {
  it('should extract IP from cf-connecting-ip header', () => {
    const headers = new Headers();
    headers.set('cf-connecting-ip', '1.2.3.4');

    const request = new Request('http://localhost', { headers });
    const ip = getClientIp(request);

    expect(ip).toBe('1.2.3.4');
  });

  it('should extract IP from x-forwarded-for header', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '5.6.7.8, 9.10.11.12');

    const request = new Request('http://localhost', { headers });
    const ip = getClientIp(request);

    expect(ip).toBe('5.6.7.8');
  });

  it('should extract IP from x-real-ip header', () => {
    const headers = new Headers();
    headers.set('x-real-ip', '13.14.15.16');

    const request = new Request('http://localhost', { headers });
    const ip = getClientIp(request);

    expect(ip).toBe('13.14.15.16');
  });

  it('should extract IP from x-vercel-forwarded-for header', () => {
    const headers = new Headers();
    headers.set('x-vercel-forwarded-for', '17.18.19.20, 21.22.23.24');

    const request = new Request('http://localhost', { headers });
    const ip = getClientIp(request);

    expect(ip).toBe('17.18.19.20');
  });

  it('should return "unknown" when no IP headers present', () => {
    const headers = new Headers();
    const request = new Request('http://localhost', { headers });
    const ip = getClientIp(request);

    expect(ip).toBe('unknown');
  });

  it('should prioritize cf-connecting-ip over other headers', () => {
    const headers = new Headers();
    headers.set('cf-connecting-ip', '1.1.1.1');
    headers.set('x-forwarded-for', '2.2.2.2');
    headers.set('x-real-ip', '3.3.3.3');

    const request = new Request('http://localhost', { headers });
    const ip = getClientIp(request);

    expect(ip).toBe('1.1.1.1');
  });
});

describe('resetRateLimit', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('should reset rate limit for specific identifier', () => {
    const identifier = 'test-ip-7';

    // Make some requests
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, {
        maxRequests: 10,
        windowMs: 60000,
      });
    }

    // Verify 5 requests were made
    const beforeReset = getRateLimitStatus(identifier, {
      maxRequests: 10,
      windowMs: 60000,
    });
    expect(beforeReset?.remaining).toBe(5);

    // Reset
    resetRateLimit(identifier);

    // Verify reset worked
    const afterReset = getRateLimitStatus(identifier, {
      maxRequests: 10,
      windowMs: 60000,
    });
    expect(afterReset).toBeNull();

    // New request should start fresh
    const result = checkRateLimit(identifier, {
      maxRequests: 10,
      windowMs: 60000,
    });
    expect(result.remaining).toBe(9);
  });
});

describe('clearAllRateLimits', () => {
  it('should clear all rate limits', () => {
    // Create rate limits for multiple identifiers
    checkRateLimit('ip-1', { maxRequests: 10, windowMs: 60000 });
    checkRateLimit('ip-2', { maxRequests: 10, windowMs: 60000 });
    checkRateLimit('ip-3', { maxRequests: 10, windowMs: 60000 });

    // Clear all
    clearAllRateLimits();

    // Verify all are cleared
    expect(getRateLimitStatus('ip-1')).toBeNull();
    expect(getRateLimitStatus('ip-2')).toBeNull();
    expect(getRateLimitStatus('ip-3')).toBeNull();

    // New requests should start fresh
    const result1 = checkRateLimit('ip-1', { maxRequests: 10, windowMs: 60000 });
    const result2 = checkRateLimit('ip-2', { maxRequests: 10, windowMs: 60000 });

    expect(result1.remaining).toBe(9);
    expect(result2.remaining).toBe(9);
  });
});

describe('getRateLimitStatus', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('should return null for non-existent identifier', () => {
    const status = getRateLimitStatus('non-existent');
    expect(status).toBeNull();
  });

  it('should return current status without incrementing count', () => {
    const identifier = 'test-ip-8';

    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      checkRateLimit(identifier, {
        maxRequests: 10,
        windowMs: 60000,
      });
    }

    // Get status multiple times
    const status1 = getRateLimitStatus(identifier, {
      maxRequests: 10,
      windowMs: 60000,
    });
    const status2 = getRateLimitStatus(identifier, {
      maxRequests: 10,
      windowMs: 60000,
    });

    // Should be same (not incrementing)
    expect(status1?.remaining).toBe(7);
    expect(status2?.remaining).toBe(7);
  });

  it('should return null for expired window', async () => {
    const identifier = 'test-ip-9';

    // Make a request
    checkRateLimit(identifier, {
      maxRequests: 10,
      windowMs: 50, // 50ms window
    });

    // Verify status exists
    const beforeExpire = getRateLimitStatus(identifier, {
      maxRequests: 10,
      windowMs: 50,
    });
    expect(beforeExpire).not.toBeNull();

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    // Status should be null
    const afterExpire = getRateLimitStatus(identifier, {
      maxRequests: 10,
      windowMs: 50,
    });
    expect(afterExpire).toBeNull();
  });

  it('should return correct allowed status', () => {
    const identifier = 'test-ip-10';

    // Use up all requests
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, {
        maxRequests: 5,
        windowMs: 60000,
      });
    }

    // Status should show not allowed
    const status = getRateLimitStatus(identifier, {
      maxRequests: 5,
      windowMs: 60000,
    });

    expect(status?.allowed).toBe(false);
    expect(status?.remaining).toBe(0);
  });
});

describe('Rate Limit Integration', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('should handle realistic scenario', async () => {
    const identifier = 'realistic-ip';
    const config = {
      maxRequests: 10,
      windowMs: 60000,
    };

    // Make 8 requests successfully
    for (let i = 0; i < 8; i++) {
      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
    }

    // Check status
    const status = getRateLimitStatus(identifier, config);
    expect(status?.remaining).toBe(2);
    expect(status?.allowed).toBe(true);

    // Make 2 more requests (hit limit)
    checkRateLimit(identifier, config);
    checkRateLimit(identifier, config);

    // Next request should fail
    const failedResult = checkRateLimit(identifier, config);
    expect(failedResult.allowed).toBe(false);
    expect(failedResult.remaining).toBe(0);

    // Headers should indicate retry time
    const headers = getRateLimitHeaders(failedResult);
    expect(headers['Retry-After']).toBeTruthy();
    expect(parseInt(headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('should handle concurrent requests from different IPs', () => {
    const config = {
      maxRequests: 5,
      windowMs: 60000,
    };

    // Simulate 3 different IPs making requests
    const ips = ['ip-a', 'ip-b', 'ip-c'];

    ips.forEach(ip => {
      for (let i = 0; i < 3; i++) {
        const result = checkRateLimit(ip, config);
        expect(result.allowed).toBe(true);
      }
    });

    // Each IP should have 2 remaining
    ips.forEach(ip => {
      const status = getRateLimitStatus(ip, config);
      expect(status?.remaining).toBe(2);
    });
  });
});
