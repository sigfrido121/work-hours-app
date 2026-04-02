import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const isLoggedIn   = !!session;

  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  if (pathname === '/login') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname === '/setup') return NextResponse.next();

  if (!session.user?.profileComplete) {
    return NextResponse.redirect(new URL('/setup', req.url));
  }

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
