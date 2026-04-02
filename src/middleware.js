import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const isLoggedIn   = !!session;

  // Always allow NextAuth internal routes
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // Login page: redirect to home if already logged in
  if (pathname === '/login') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Setup page: only for users with incomplete profile
  if (pathname === '/setup') return NextResponse.next();

  // If profile not complete, force setup
  if (!session.user?.profileComplete) {
    return NextResponse.redirect(new URL('/setup', req.url));
  }

  // Admin routes: only for admins
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!session.user?.isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
