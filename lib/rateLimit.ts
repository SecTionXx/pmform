/**
 * Rate limiting utility using in-memory storage
 * For production, consider using Redis (Upstash) for distributed rate limiting
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limiting
// Note: This will reset when the server restarts
// For production with multiple instances, use Redis
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 10
   */
  maxRequests?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Custom identifier (if not using IP)
   */
  identifier?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Maximum requests allowed
   */
  limit: number;

  /**
   * Time until the rate limit resets (in seconds)
   */
  resetIn: number;

  /**
   * Timestamp when the rate limit resets
   */
  resetAt: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = checkRateLimit(ipAddress, {
 *   maxRequests: 10,
 *   windowMs: 60000, // 1 minute
 * });
 *
 * if (!result.allowed) {
 *   return new Response('Too Many Requests', {
 *     status: 429,
 *     headers: {
 *       'X-RateLimit-Limit': result.limit.toString(),
 *       'X-RateLimit-Remaining': result.remaining.toString(),
 *       'X-RateLimit-Reset': result.resetAt.toString(),
 *     },
 *   });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const maxRequests = config.maxRequests ?? 10;
  const windowMs = config.windowMs ?? 60000; // 1 minute
  const key = config.identifier ?? identifier;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  // No record exists, create new one
  if (!record) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      limit: maxRequests,
      resetIn: Math.ceil(windowMs / 1000),
      resetAt: resetTime,
    };
  }

  // Record exists but window has expired, reset
  if (record.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      limit: maxRequests,
      resetIn: Math.ceil(windowMs / 1000),
      resetAt: resetTime,
    };
  }

  // Record exists and window is still active
  const newCount = record.count + 1;

  // Update count
  rateLimitStore.set(key, {
    count: newCount,
    resetTime: record.resetTime,
  });

  const allowed = newCount <= maxRequests;
  const remaining = Math.max(0, maxRequests - newCount);
  const resetIn = Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    limit: maxRequests,
    resetIn,
    resetAt: record.resetTime,
  };
}

/**
 * Get rate limit headers for HTTP response
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
    'Retry-After': result.resetIn.toString(),
  };
}

/**
 * Extract IP address from request
 * Handles various proxy headers
 *
 * @param request - Next.js request object
 * @returns IP address
 */
export function getClientIp(request: Request): string {
  // Try various headers set by proxies/load balancers
  const headers = request.headers;

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Common proxy headers
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Vercel
  const xVercelForwardedFor = headers.get('x-vercel-forwarded-for');
  if (xVercelForwardedFor) {
    return xVercelForwardedFor.split(',')[0].trim();
  }

  // Default fallback
  return 'unknown';
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual override
 *
 * @param identifier - Unique identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limit records
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get current rate limit status without incrementing
 *
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Current status
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult | null {
  const maxRequests = config.maxRequests ?? 10;
  const windowMs = config.windowMs ?? 60000;
  const key = config.identifier ?? identifier;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    return null;
  }

  const remaining = Math.max(0, maxRequests - record.count);
  const resetIn = Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed: record.count < maxRequests,
    remaining,
    limit: maxRequests,
    resetIn,
    resetAt: record.resetTime,
  };
}
