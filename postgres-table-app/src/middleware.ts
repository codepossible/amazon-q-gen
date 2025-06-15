import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login';

  // Check for auth token in cookies
  const token = request.cookies.get('idToken')?.value;
  const isAuthenticated = !!token;

  // Redirect logic
  if (!isPublicPath && !isAuthenticated) {
    // Redirect to login if accessing a protected route without authentication
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicPath && isAuthenticated) {
    // Redirect to home if accessing login while authenticated
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure the paths that should be checked by the middleware
export const config = {
  matcher: ['/', '/tables/:path*', '/login'],
};