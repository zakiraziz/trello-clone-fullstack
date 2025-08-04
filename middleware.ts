import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/account(.*)',
  '/settings(.*)',
  '/admin(.*)',
  '/api(.*)', // Protect all API routes by default
]);

// Define public routes that should bypass auth
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/blog(.*)',
  '/about',
  '/contact',
  '/api/public(.*)', // Explicit public API routes
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // Skip middleware for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    auth().protect({
      // Redirect unauthenticated users to sign-in page
      unauthenticatedUrl: '/sign-in?redirect_url=' + encodeURIComponent(req.nextUrl.pathname),
      // Redirect unauthorized users (without role) to home
      unauthorizedUrl: '/?error=unauthorized',
    });

    // Optional: Add role-based protection
    // if (req.nextUrl.pathname.startsWith('/admin')) {
    //   auth().protect({ role: 'org:admin' });
    // }
  }

  // Set security headers for all routes
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  // CSP Header - adjust based on your needs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' *.clerk.dev *.yourdomain.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: *.clerk.dev",
    "font-src 'self'",
    "connect-src 'self' *.clerk.dev",
    "frame-src *.clerk.dev",
    `form-action 'self'`,
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Logging (for debugging)
  console.log(`[Middleware] Path: ${req.nextUrl.pathname}`, {
    userId: auth().userId,
    sessionId: auth().sessionId,
    orgId: auth().orgId,
  });

  return response;
});

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    '/((?!_next|static|favicon.ico|robots.txt|sitemap.xml|[^?]*\\.(?:png|jpe?g|gif|svg|css|js|ico|webp|txt|xml|json)).*)',
    // Include API routes
    '/(api|trpc)(.*)',
    // Include all dynamic routes
    '/(.*?\\..*?|.*?\\[.*?\\].*?)',
  ],
};
