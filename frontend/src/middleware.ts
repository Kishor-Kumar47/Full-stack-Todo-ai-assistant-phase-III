import { NextRequest, NextResponse } from 'next/server';

// This function checks if the user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  // Check for the presence of a JWT token in localStorage (via cookie fallback)
  // Since middleware runs on server, we check cookies or Authorization header
  const token = request.cookies.get('access_token') || request.headers.get('Authorization');

  if (!token) {
    return false;
  }

  // In a real implementation, you would validate the JWT token here
  // For now, we'll just check if it exists
  return true;
}

// Define which paths should NOT require authentication
const publicPaths = [
  '/auth/login',
  '/auth/signup',
  '/api/auth',
  // Add other public routes as needed
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is public (doesn't require authentication)
  const isPublicPath = publicPaths.some(path =>
    pathname.startsWith(path)
  );

  // If it's a public path, allow access without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For all other paths, check if user is authenticated
  if (!isAuthenticated(request)) {
    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Continue to the requested page if authenticated
  return NextResponse.next();
}

// Specify which paths the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};