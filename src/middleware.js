import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const isLoggedIn   = !!session;

  // NextAuth endpoints — siempre pasar
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  if (pathname === '/login') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Usuario autenticado: las API routes gestionan su propio acceso
  if (pathname.startsWith('/api/')) {
    // Solo restringir rutas de admin
    if (pathname.startsWith('/api/admin') && !session.user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname === '/setup') return NextResponse.next();

  if (!session.user?.profileComplete) {
    return NextResponse.redirect(new URL('/setup', req.url));
  }

  if (pathname.startsWith('/admin') && !session.user?.isAdmin) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
