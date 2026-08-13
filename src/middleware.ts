import { NextRequest, NextResponse } from 'next/server';

// Get JWT_SECRET from environment
const JWT_SECRET = process.env.JWT_SECRET || 'learning-hub-super-secret-jwt-key-production-ready-2026-secure-token-v2';

// Warn if using fallback secret in development only
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ WARNING: Using fallback JWT_SECRET. Please set JWT_SECRET in .env.local for production!');
}

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified?: boolean;
}

// Edge-compatible JWT verification using Web Crypto API
async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Split JWT token
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Verify signature using Web Crypto API
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${header}.${payload}`);
    const signatureBytes = new Uint8Array(
      Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')))
        .map(c => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);

    if (!isValid) return null;

    // Decode payload
    const decodedPayload = JSON.parse(decoder.decode(
      new Uint8Array(Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        .map(c => c.charCodeAt(0)))
    ));

    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null;
    }

    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
      name: decodedPayload.name,
      role: decodedPayload.role,
      isEmailVerified: decodedPayload.isEmailVerified
    };
  } catch (error: any) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ Token verification failed: ${error.message}`);
    }
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/courses',
    '/tutors',
    '/faq',
    '/progress',
    '/login',
    '/register',
    '/become-tutor',
    '/verify-pending',
    '/verify-email'
  ];

  // Check if it's an API route - allow all API routes to pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if it's a static file or Next.js internal
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  let user: TokenPayload | null = null;

  // Try to verify token if it exists
  if (token) {
    user = await verifyTokenEdge(token);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Middleware: User authenticated - ${user?.email} (${user?.role}) on ${pathname}`);
    }
  }

  // Enforce email verification for non-admin users on protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/parent-hub');

  if (user && user.role !== 'admin' && user.isEmailVerified === false) {
    const isVerificationRoute = pathname === '/verify-pending' || pathname === '/verify-email' || pathname.startsWith('/verify-email/');
    if (!isVerificationRoute && isProtectedRoute) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Middleware: Email not verified. Redirecting protection to /verify-pending`);
      }
      return NextResponse.redirect(new URL('/verify-pending', request.url));
    }
  }

  // If user is authenticated and tries to access login/register, redirect to appropriate place
  if (user && (pathname === '/login' || pathname === '/register')) {
    const isUnverifiedUser = user.role !== 'admin' && user.isEmailVerified === false;

    if (!isUnverifiedUser) {
      const redirectParam = request.nextUrl.searchParams.get('redirect');

      // If there's a valid redirect parameter, go there directly  
      if (redirectParam && (redirectParam.startsWith('/onboarding') || redirectParam.startsWith('/dashboard'))) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }

      // Otherwise redirect to role-appropriate dashboard
      const dashboardPath = `/dashboard/${user.role}`;
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // Allow access to onboarding routes for authenticated users
  // This is important for new users completing their profiles
  if (user && pathname.startsWith('/onboarding')) {
    return NextResponse.next();
  }


  // If user is authenticated and tries to access generic dashboard, redirect to role-specific
  if (user && pathname === '/dashboard') {
    const dashboardPath = `/dashboard/${user.role}`;
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // If it's a public route and user is not authenticated (or doesn't need redirect), allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if it's a protected route (already defined above)

  // If it's a protected route and no valid user, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for dashboard routes
  if (user && pathname.startsWith('/dashboard/')) {
    const dashboardRole = pathname.split('/dashboard/')[1]?.split('/')[0];

    // If trying to access a different role's dashboard, redirect to own dashboard
    if (dashboardRole && dashboardRole !== user.role) {
      const correctDashboard = `/dashboard/${user.role}`;
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - files with extensions (.js, .css, .png, etc.)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};