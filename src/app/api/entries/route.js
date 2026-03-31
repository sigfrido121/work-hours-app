import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { NextResponse } from 'next/server';

function validateEntryBody(body) {
    const errors = [];
    if (!body.date) errors.push('La fecha es requerida');
    if (body.morning?.enabled) {
        if (!body.morning.start || !body.morning.end) errors.push('Los horarios de mañana son requeridos cuando está habilitado');
        else if (body.morning.start >= body.morning.end) errors.push('La hora de salida de mañana debe ser posterior a la entrada');
    }
    if (body.afternoon?.enabled) {
        if (!body.afternoon.start || !body.afternoon.end) errors.push('Los horarios de tarde son requeridos cuando está habilitado');
        else if (body.afternoon.start >= body.afternoon.end) errors.push('La hora de salida de tarde debe ser posterior a la entrada');
    }
    if (!body.morning?.enabled && !body.afternoon?.enabled) errors.push('Debes habilitar al menos un turno');
    return errors;
}

export async function GET(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1');
    const limit = parseInt(searchParams.get('limit') || '31');
    const skip  = (page - 1) * limit;

    try {
        await dbConnect();
        const filter = { userId: session.user.id };
        const [entries, total] = await Promise.all([
            Entry.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
            Entry.countDocuments(filter),
        ]);
        return NextResponse.json({
            success: true,
            data: entries,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ success: false, error: 'Error al obtener las entradas' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();
        const validationErrors = validateEntryBody(body);
        if (validationErrors.length > 0) {
            return NextResponse.json({ success: false, error: validationErrors.join(', ') }, { status: 400 });
        }
        const date = new Date(body.date);
        date.setUTCHours(0, 0, 0, 0);
        const entry = await Entry.findOneAndUpdate(
            { userId: session.user.id, date },
            { ...body, date, userId: session.user.id },
            { upsert: true, new: true, runValidators: true }
        );
        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json({ success: false, error: 'Error al guardar la entrada' }, { status: 400 });
    }
}
