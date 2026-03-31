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

  return NextResponse.json({ success: true });
}
