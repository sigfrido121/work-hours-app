import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { NextResponse } from 'next/server';

// Returns entries for a userId, or all entries if ?all=true (admin only)
export async function GET(request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const all    = searchParams.get('all') === 'true';
  const userId = searchParams.get('userId');

  await dbConnect();

  if (all) {
    const entries = await Entry.find({}).sort({ date: -1 }).limit(3650).lean();
    return NextResponse.json({ success: true, data: entries });
  }

  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  const entries = await Entry.find({ userId }).sort({ date: -1 }).limit(365).lean();
  return NextResponse.json({ success: true, data: entries });
}
