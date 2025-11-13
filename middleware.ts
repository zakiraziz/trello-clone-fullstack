import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

// Define public routes that should bypass auth
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/blog(.*)',
  '/about',
  '/contact',
  '/api/public(.*)',
  '/api/webhooks(.*)', // Webhooks are typically public
  '/auth/callback', // OAuth callbacks
  '/health', // Health check endpoint
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/account(.*)',
  '/settings(.*)',
  '/admin(.*)',
  '/billing(.*)',
  '/workspace(.*)',
  '/api(.*)', // Protect all API routes by default
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/analytics(.*)',
]);

// Define webhook routes that need special handling
const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/clerk',
  '/api/webhooks/stripe',
]);

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  
  const current = rateLimitStore.get(identifier) || { count: 0, resetTime: now };
  
  if (current.resetTime < windowStart) {
    // Reset counter for new window
    current.count = 0;
    current.resetTime = now;
  }
  
  current.count++;
  rateLimitStore.set(identifier, current);
  
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - current.count);
  
  return {
    allowed: current.count <= RATE_LIMIT_MAX_REQUESTS,
    remaining,
  };
}

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname, search } = req.nextUrl;
  const fullPath = pathname + search;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  
  // Skip middleware for public routes
  if (isPublicRoute(req)) {
    // Apply rate limiting to public API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitResult = checkRateLimit(`api:${ip}`);
      
      if (!rateLimitResult.allowed) {
        console.warn(`[Rate Limit] IP: ${ip}, Path: ${pathname}, User-Agent: ${userAgent}`);
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString(),
          }
        });
      }
    }
    
    return NextResponse.next();
  }

  // Handle webhook routes separately
  if (isWebhookRoute(req)) {
    // Webhooks should bypass Clerk auth but may have their own verification
    const response = NextResponse.next();
    
    // Add security headers for webhooks
    response.headers.set('X-Webhook-Handler', 'true');
    
    return response;
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    const session = auth();
    
    // Apply stricter rate limiting for authenticated users
    const rateLimitIdentifier = session.userId ? `user:${session.userId}` : `ip:${ip}`;
    const rateLimitResult = checkRateLimit(rateLimitIdentifier);
    
    if (!rateLimitResult.allowed) {
      console.warn(`[Rate Limit] User: ${session.userId}, IP: ${ip}, Path: ${pathname}`);
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString(),
        }
      });
    }

    // Role-based access control for admin routes
    if (isAdminRoute(req)) {
      return auth().protect({
        role: ['org:admin', 'org:super_admin'],
        unauthenticatedUrl: '/sign-in?redirect_url=' + encodeURIComponent(fullPath),
        unauthorizedUrl: '/dashboard?error=admin_access_required',
      });
    }

    // General protection for all protected routes
    return auth().protect({
      unauthenticatedUrl: '/sign-in?redirect_url=' + encodeURIComponent(fullPath),
      unauthorizedUrl: '/?error=unauthorized_access',
    });
  }

  // For all other routes, proceed with security headers
  const response = NextResponse.next();
  
  // Enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()'
  );
  
  // HSTS Header - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  
  // CSP Header - adjust based on your needs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.dev *.stripe.com *.yourdomain.com",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: blob: *.clerk.dev *.stripe.com *.githubusercontent.com images.unsplash.com",
    "font-src 'self' fonts.gstatic.com",
    "connect-src 'self' *.clerk.dev *.stripe.com *.yourdomain.com",
    "frame-src *.clerk.dev *.stripe.com",
    "child-src *.clerk.dev",
    `form-action 'self'`,
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Add rate limit headers to all responses
  const rateLimitIdentifier = auth().userId ? `user:${auth().userId}` : `ip:${ip}`;
  const currentRateLimit = rateLimitStore.get(rateLimitIdentifier);
  if (currentRateLimit) {
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', 
      Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentRateLimit.count).toString()
    );
    response.headers.set('X-RateLimit-Reset', currentRateLimit.resetTime.toString());
  }

  // Enhanced logging with structured data
  const logData = {
    path: pathname,
    method: req.method,
    ip: ip,
    userAgent: userAgent,
    userId: auth().userId,
    sessionId: auth().sessionId,
    orgId: auth().orgId,
    timestamp: new Date().toISOString(),
    userRoles: auth().sessionClaims?.metadata?.role || 'none',
  };

  // Log differently based on environment
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware]', JSON.stringify(logData, null, 2));
  } else {
    console.log('[Middleware]', JSON.stringify(logData));
  }

  // Add request ID for tracing
  response.headers.set('X-Request-ID', generateRequestId());

  return response;
});

// Generate a unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Optional: Add geo-blocking or country restrictions
function isAllowedCountry(countryCode: string): boolean {
  const blockedCountries = ['CU', 'IR', 'KP', 'SY', 'RU']; // Example blocked countries
  return !blockedCountries.includes(countryCode.toUpperCase());
}

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:ico|png|jpg|jpeg|gif|svg|css|js|webp|txt|xml|json)$).*)',
    // Include API routes
    '/(api|trpc)(.*)',
    // Include all dynamic routes
    '/(.*?\\..*?|.*?\\[.*?\\].*?)',
  ],
};
