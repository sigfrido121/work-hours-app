import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

// Returns all entries for a given userId (admin only)
export async function GET(request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });

  await dbConnect();
  const entries = await Entry.find({ userId }).sort({ date: -1 }).limit(365).lean();
  return NextResponse.json({ success: true, data: entries });
}
