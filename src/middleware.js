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

  // Las rutas de API las gestionan ellas mismas
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/admin') && !session.user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname === '/setup') return NextResponse.next();

  // El perfil está completo si el JWT lo dice O si la cookie puente está presente
  const setupDone = session.user?.profileComplete ||
                    req.cookies.get('wh-setup-done')?.value === '1';

  if (!setupDone) {
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
