import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  return NextResponse.json({ success: true, data: user });
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { firstName, lastName } = await req.json();
  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: 'Nombre y apellido son obligatorios' }, { status: 400 });
  }

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    firstName:       firstName.trim(),
    lastName:        lastName.trim(),
    profileComplete: true,
  });

  // Cookie que el middleware lee para saber que el perfil ya está completo
  // (el JWT se actualiza en el siguiente login; esto es el puente)
  const res = NextResponse.json({ success: true });
  res.cookies.set('wh-setup-done', '1', {
    path:     '/',
    maxAge:   60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  });
  return res;
}
