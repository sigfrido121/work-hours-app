import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        await dbConnect();
        const body = await request.json();
        const entry = await Entry.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!entry) {
            return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await dbConnect();
        const deletedEntry = await Entry.deleteOne({ _id: id });
        if (!deletedEntry) {
            return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
