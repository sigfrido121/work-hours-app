import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const entries = await Entry.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Normalize date to midnight UTC
        const date = new Date(body.date);
        date.setUTCHours(0, 0, 0, 0);

        const entry = await Entry.findOneAndUpdate(
            { date },
            { ...body, date },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
