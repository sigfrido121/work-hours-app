import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  await dbConnect();
  const users = await User.find({}, '-__v').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: users });
}

export async function PATCH(req) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { userId, isAdmin } = await req.json();
  await dbConnect();
  await User.findByIdAndUpdate(userId, { isAdmin });
  return NextResponse.json({ success: true });
}
