import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rateLimit';

/**
 * Middleware for rate limiting API requests
 * Applies to all /api/* routes
 */
export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIp(request);

    // Check rate limit: 10 requests per minute per IP
    const rateLimitResult = checkRateLimit(ip, {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
    });

    // Add rate limit headers to response
    const headers = getRateLimitHeaders(rateLimitResult);

    // If rate limit exceeded, return 429
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'มีการส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
          error: 'Too Many Requests',
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Request allowed, add rate limit headers
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  return NextResponse.next();
}

// Configure which routes middleware applies to
export const config = {
  matcher: '/api/:path*',
};
